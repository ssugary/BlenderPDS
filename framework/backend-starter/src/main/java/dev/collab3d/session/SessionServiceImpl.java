package dev.collab3d.session;

import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.SessionParticipant;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.model.User;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.repository.SessionParticipantRepository;
import dev.collab3d.repository.SessionRepository;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.sequencer.OperationSequencer;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.JoinDecision;
import dev.collab3d.spi.JoinRequest;
import dev.collab3d.spi.SessionCapacityPolicy;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionJoinPolicy;
import dev.collab3d.spi.SessionVisibilityPolicy;
import dev.collab3d.session.SessionEndedEvent;
import dev.collab3d.session.SessionOperationInput;
import dev.collab3d.session.SessionService;
import jakarta.persistence.EntityNotFoundException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link SessionService} on top of JPA: room lifecycle, presence and the operation
 * log.
 *
 * <p>Two rules shape this class. Every state change that can race takes the session
 * row with a pessimistic write lock ({@code findByIdForUpdate}): without it two joins
 * could both see a free seat, and two appends could compute the same
 * {@code MAX(seq)+1}. And the server never interprets the CRDT — it checks the shape
 * at the edge, orders, deduplicates by {@code (siteId, lamport)} and persists. The
 * scene belongs to the client; the snapshot stored here is only its materialisation,
 * kept for fast reads.
 */
@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    /** Rooms of up to 4 people: N participants, but a cap the CRDT copes with well. */
    public static final int MAX_PARTICIPANTS = 4;

    /** Cap on the scene snapshot, so one connection cannot push the database out of memory. */
    public static final int MAX_SNAPSHOT_BYTES = 1_000_000;

    private static final int CODE_LENGTH = 10;
    private static final int CODE_ATTEMPTS = 5;

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final SessionOperationRepository operationRepository;
    private final UserRepository userRepository;
    private final OperationSequencer sequencer;
    private final SessionContextFactory contextFactory;
    private final List<SessionJoinPolicy> joinPolicies;
    private final List<SessionCapacityPolicy> capacityPolicies;
    private final List<SessionVisibilityPolicy> visibilityPolicies;
    private final ApplicationEventPublisher events;

    @Override
    @Transactional
    public Session createSession(Long hostId) {
        User host = findUserOrThrow(hostId);

        // One open room per host: the "I am hosting" concept stays unambiguous.
        sessionRepository.findFirstByHostIdAndStatusNot(hostId, SessionStatus.ENDED)
                .ifPresent(open -> {
                    throw new IllegalStateException("Este host já tem uma sessão aberta: " + open.getCode());
                });

        Session session = new Session();
        session.setHost(host);
        session.setStatus(SessionStatus.WAITING);
        session.setCode(generateUniqueCode());
        Session saved = sessionRepository.save(session);

        // The host joins as an already created participant, but INACTIVE: the WebSocket
        // is what marks presence. That way a created-then-abandoned room takes no seat.
        SessionParticipant participant = new SessionParticipant();
        participant.setSession(saved);
        participant.setUser(host);
        participant.setActive(false);
        participant.setLastSeenAt(Instant.now());
        participantRepository.save(participant);

        return saved;
    }

    @Override
    public Optional<Session> getById(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    @Override
    public Optional<Session> getByCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }
        return sessionRepository.findByCode(code.trim().toUpperCase(Locale.ROOT));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Session> getOpenSessionFor(Long hostId) {
        return sessionRepository.findFirstByHostIdAndStatusNot(hostId, SessionStatus.ENDED);
    }

    // saves the session on the database
    @Override
    @Transactional
    public Session joinSession(Long sessionId, Long userId) {
        // Lock: two simultaneous joins cannot both see the room as having a free seat.
        Session session = findSessionForUpdateOrThrow(sessionId);
        User user = findUserOrThrow(userId);
        assertJoinable(session, user.getId(), false);

        SessionParticipant participant = participantRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElseGet(SessionParticipant::new);
        participant.setSession(session);
        participant.setUser(user);
        if (participant.getId() == null) {
            participant.setActive(false);
        }
        participant.setLastSeenAt(Instant.now());
        participantRepository.save(participant);

        return session;
    }

    // connects the participants socket to the server
    @Override
    @Transactional
    public SessionParticipant connectParticipant(Long sessionId, Long userId) {
        Session session = findSessionForUpdateOrThrow(sessionId);
        User user = findUserOrThrow(userId);
        assertJoinable(session, user.getId(), true);

        SessionParticipant participant = participantRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElseGet(SessionParticipant::new);
        participant.setSession(session);
        participant.setUser(user);
        participant.setActive(true);
        participant.setLastSeenAt(Instant.now());
        SessionParticipant saved = participantRepository.save(participant);

        if (session.getStatus() == SessionStatus.WAITING) {
            session.setStatus(SessionStatus.ACTIVE);
            sessionRepository.save(session);
        }
        return saved;
    }

    @Override
    @Transactional
    public void leaveSession(Long sessionId, Long userId) {
        // Lenient: it runs on socket close, including of an already ended/deleted room.
        Optional<SessionParticipant> found = participantRepository.findBySessionIdAndUserId(sessionId, userId);
        if (found.isEmpty()) {
            return;
        }

        SessionParticipant participant = found.get();
        participant.setActive(false);
        participant.setLastSeenAt(Instant.now());
        participantRepository.save(participant);

        if (participantRepository.countBySessionIdAndActiveTrue(sessionId) == 0) {
            sessionRepository.findById(sessionId)
                    .filter(session -> session.getStatus() == SessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        session.setStatus(SessionStatus.WAITING);
                        sessionRepository.save(session);
                    });
        }
    }

    @Override
    @Transactional
    public void endSession(Long sessionId, Long userId) {
        Session session = findSessionForUpdateOrThrow(sessionId);
        if (!session.getHost().getId().equals(userId)) {
            throw new AccessDeniedException("Só o host pode encerrar a sessão " + sessionId);
        }
        if (session.getStatus() == SessionStatus.ENDED) {
            return;
        }

        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(Instant.now());
        sessionRepository.save(session);

        for (SessionParticipant participant : participantRepository.findBySessionIdOrderByJoinedAtAsc(sessionId)) {
            participant.setActive(false);
            participant.setLastSeenAt(Instant.now());
            participantRepository.save(participant);
        }

        // The WebSocket layer listens (after the commit) and drops the connections.
        events.publishEvent(new SessionEndedEvent(sessionId));
    }

    @Override
    public List<SessionParticipant> getParticipants(Long sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new EntityNotFoundException("Sessão não encontrada: " + sessionId);
        }
        return participantRepository.findBySessionIdOrderByJoinedAtAsc(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countParticipants(Long sessionId) {
        return participantRepository.countBySessionId(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Session> getJoinableSessionsFor(Long userId) {
        User user = findUserOrThrow(userId);
        List<Long> friendIds = user.getFriendList().stream().map(User::getId).toList();
        if (friendIds.isEmpty()) {
            return List.of();
        }
        // Only ACTIVE rooms: that is what the friend list shows as really "hosting"
        // (host connected), instead of a room that was created and abandoned.
        List<Session> rooms = sessionRepository.findOpenByHostIds(friendIds, SessionStatus.ACTIVE);
        if (rooms.isEmpty()) {
            return List.of();
        }

        // Visibility is a chain, not a permission: what it hides is only removed from
        // this listing (the room may still be joinable by code).
        Actor viewer = contextFactory.actor(userId);
        List<Session> visible = new ArrayList<>(rooms.size());
        for (Session room : rooms) {
            if (visibleTo(room, viewer)) {
                visible.add(room);
            }
        }
        return visible;
    }

    /**
     * Kept on the service for its callers; the lock, the {@code seq} and the dedupe now
     * belong to {@link OperationSequencer} (P1.7).
     */
    @Override
    public List<SessionOperation> appendOperations(Long sessionId, Long userId, List<SessionOperationInput> inputs) {
        return sequencer.append(sessionId, userId, inputs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionOperation> syncSince(Long sessionId, Map<String, Integer> versionVector) {
        List<SessionOperation> all = operationRepository.findBySessionIdOrderBySeqAsc(sessionId);
        if (versionVector == null || versionVector.isEmpty()) {
            return all;
        }

        // In-memory filter: the log of a study room fits comfortably, and this way we
        // avoid mirroring the version vector in SQL.
        return all.stream()
                .filter(op -> op.getLamport() > versionVector.getOrDefault(op.getSiteId(), 0))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionOperation> syncSinceSeq(Long sessionId, Long seq) {
        long from = seq == null ? 0L : seq;
        return operationRepository.findBySessionIdOrderBySeqAsc(sessionId).stream()
                .filter(op -> op.getSeq() > from)
                .toList();
    }

    @Override
    @Transactional
    public void saveSnapshot(Long sessionId, Long userId, String snapshotJson) {
        if (snapshotJson == null || snapshotJson.isBlank()) {
            throw new IllegalArgumentException("Snapshot vazio");
        }
        if (snapshotJson.getBytes(StandardCharsets.UTF_8).length > MAX_SNAPSHOT_BYTES) {
            throw new IllegalArgumentException("Snapshot maior que " + MAX_SNAPSHOT_BYTES + " bytes");
        }

        Session session = findSessionForUpdateOrThrow(sessionId);
        // Having participated (even if already disconnected) is enough: the final
        // snapshot is usually sent exactly while the socket is closing.
        if (!participantRepository.existsBySessionIdAndUserId(sessionId, userId)) {
            throw new AccessDeniedException("Usuário " + userId + " não participa da sessão " + sessionId);
        }

        session.setSceneSnapshot(snapshotJson);
        sessionRepository.save(session);
    }

    @Override
    public Optional<String> getSnapshot(Long sessionId) {
        return sessionRepository.findById(sessionId).map(Session::getSceneSnapshot);
    }

    @Override
    @Transactional
    public void deleteAllForUser(Long userId) {
        // The scene history does not die with its author: we only drop the FK.
        operationRepository.detachAuthor(userId);
        participantRepository.deleteByUserId(userId);

        // The rooms they hosted go away whole (ops + participants).
        for (Session hosted : sessionRepository.findByHostId(userId)) {
            operationRepository.deleteBySessionId(hosted.getId());
            participantRepository.deleteBySessionId(hosted.getId());
            sessionRepository.delete(hosted);
        }
    }

    /**
     * Common entry rules: the {@link SessionJoinPolicy} chain (whose default reproduces
     * "host or friend of the host, and not an ended room") and, when connecting, the
     * {@link SessionCapacityPolicy} chain.
     *
     * <p>All policies that serve this app type must approve; the first denial wins and
     * carries the HTTP status that maps back to the pre-refactor exception (404/403/409).
     */
    private void assertJoinable(Session session, Long userId, boolean checkCapacity) {
        SessionContext ctx = contextFactory.sessionContext(session.getId());
        Actor joiner = contextFactory.actor(userId);

        for (SessionJoinPolicy policy : joinPolicies) {
            if (!policy.supports(ctx.appType())) {
                continue;
            }
            JoinDecision decision = policy.decide(ctx, joiner, JoinRequest.none());
            if (!decision.allowed()) {
                throw denial(decision);
            }
        }

        if (checkCapacity) {
            int max = capacityPolicies.stream()
                    .filter(policy -> policy.supports(ctx.appType()))
                    .mapToInt(policy -> policy.maxParticipants(ctx))
                    .min()
                    .orElse(MAX_PARTICIPANTS);
            // Excludes the user themselves: somebody reconnecting does not take two seats.
            long others = participantRepository.countBySessionIdAndActiveTrueAndUserIdNot(session.getId(), userId);
            if (others >= max) {
                throw new IllegalStateException("Sessão cheia (" + max + " participantes)");
            }
        }
    }

    /** Whether every visibility policy that serves this app type lets the viewer see it. */
    private boolean visibleTo(Session room, Actor viewer) {
        SessionContext ctx = contextFactory.sessionContext(room.getId());
        for (SessionVisibilityPolicy policy : visibilityPolicies) {
            if (policy.supports(ctx.appType()) && !policy.visibleTo(ctx, viewer)) {
                return false;
            }
        }
        return true;
    }

    /** Keeps the REST mapping the client already knows when a policy says no. */
    private RuntimeException denial(JoinDecision decision) {
        String message = decision.message() == null ? decision.code() : decision.message();
        HttpStatus status = decision.statusIfDenied();
        if (status == HttpStatus.NOT_FOUND) {
            return new EntityNotFoundException(message);
        }
        if (status == HttpStatus.CONFLICT) {
            return new IllegalStateException(message);
        }
        if (status == HttpStatus.BAD_REQUEST) {
            return new IllegalArgumentException(message);
        }
        return new AccessDeniedException(message);
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
            String code = UUID.randomUUID().toString().replace("-", "")
                    .substring(0, CODE_LENGTH)
                    .toUpperCase(Locale.ROOT);
            if (!sessionRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Não foi possível gerar um código único de sessão");
    }

    private Session findSessionForUpdateOrThrow(Long sessionId) {
        return sessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada: " + sessionId));
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userId));
    }
}
