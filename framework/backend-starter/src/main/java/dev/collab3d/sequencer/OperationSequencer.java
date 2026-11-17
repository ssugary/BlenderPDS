package dev.collab3d.sequencer;

import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.SessionParticipant;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.repository.SessionParticipantRepository;
import dev.collab3d.repository.SessionRepository;
import dev.collab3d.session.SessionOperationInput;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * The global order of a room's operation log: takes the session row lock, checks that
 * the sender is connected and the room is open, assigns the next {@code seq} and drops
 * redeliveries by {@code (siteId, lamport)}.
 *
 * <p>It used to be the body of {@code SessionServiceImpl.appendOperations} (P1.7). It
 * lives on its own because it is the piece that every write goes through — REST today,
 * the WebSocket appender and, later, operations the server itself emits — and because
 * the session service was carrying room lifecycle <em>and</em> sequencing in one class.
 *
 * <p>Two rules keep it correct under concurrency:
 * <ul>
 *   <li>the pessimistic lock on the session row serialises appends, so two connections
 *       cannot compute the same {@code MAX(seq)+1};</li>
 *   <li>the dedupe check happens inside the same transaction as the insert, so a retry
 *       of the same operation never creates a second row.</li>
 * </ul>
 *
 * @throws EntityNotFoundException if the session does not exist
 * @throws AccessDeniedException   if the sender is not connected to the session
 * @throws IllegalStateException   if the session is ended
 */
@Component
@RequiredArgsConstructor
public class OperationSequencer {

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final SessionOperationRepository operationRepository;

    @Transactional
    public List<SessionOperation> append(Long sessionId, Long userId, List<SessionOperationInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            return List.of();
        }

        Session session = sessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada: " + sessionId));
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
}
