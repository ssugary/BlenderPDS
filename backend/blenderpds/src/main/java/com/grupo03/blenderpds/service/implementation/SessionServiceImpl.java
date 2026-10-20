package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionOperation;
import com.grupo03.blenderpds.model.SessionParticipant;
import com.grupo03.blenderpds.model.SessionStatus;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.SessionOperationRepository;
import com.grupo03.blenderpds.repository.SessionParticipantRepository;
import com.grupo03.blenderpds.repository.SessionRepository;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.SessionEndedEvent;
import com.grupo03.blenderpds.service.SessionOperationInput;
import com.grupo03.blenderpds.service.SessionService;
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
        return sessionRepository.findOpenByHostIds(friendIds, SessionStatus.ACTIVE);
    }

    @Override
    @Transactional
    public List<SessionOperation> appendOperations(Long sessionId, Long userId, List<SessionOperationInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            return List.of();
        }

        Session session = findSessionForUpdateOrThrow(sessionId);
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalStateException("Sessão encerrada: " + sessionId);
        }

        SessionParticipant participant = participantRepository.findBySessionIdAndUserId(sessionId, userId)
                .filter(SessionParticipant::isActive)
                .orElseThrow(() -> new AccessDeniedException("Participante não está conectado à sessão " + sessionId));

        long nextSeq = operationRepository.findTopBySessionIdOrderBySeqDesc(sessionId)
                .map(last -> last.getSeq() + 1)
                .orElse(1L);

        List<SessionOperation> saved = new ArrayList<>();
        for (SessionOperationInput input : inputs) {
            // Redelivery (reconnect, retry): the op is already in the log, nothing to do.
            if (operationRepository.existsBySessionIdAndSiteIdAndLamport(sessionId, input.siteId(), input.lamport())) {
                continue;
            }

            SessionOperation operation = new SessionOperation();
            operation.setSession(session);
            operation.setSeq(nextSeq++);
            operation.setSiteId(input.siteId());
            operation.setLamport(input.lamport());
            operation.setAuthor(participant.getUser());
            operation.setKind(input.kind());
            operation.setPayload(input.payload());
            saved.add(operationRepository.save(operation));
        }

        return saved;
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

    /** Common entry rules: state, friendship with the host and (optionally) capacity. */
    private void assertJoinable(Session session, Long userId, boolean checkCapacity) {
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalStateException("Sessão encerrada: " + session.getId());
        }

        Long hostId = session.getHost().getId();
        boolean isHost = hostId.equals(userId);
        if (!isHost && !userRepository.areFriends(hostId, userId)) {
            throw new AccessDeniedException("Só amigos do host podem entrar nesta sessão");
        }

        if (checkCapacity) {
            // Excludes the user themselves: somebody reconnecting does not take two seats.
            long others = participantRepository.countBySessionIdAndActiveTrueAndUserIdNot(session.getId(), userId);
            if (others >= MAX_PARTICIPANTS) {
                throw new IllegalStateException("Sessão cheia (" + MAX_PARTICIPANTS + " participantes)");
            }
        }
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
