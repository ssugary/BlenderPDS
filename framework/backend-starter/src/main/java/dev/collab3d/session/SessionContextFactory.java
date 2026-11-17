package dev.collab3d.session;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.SessionParticipant;
import dev.collab3d.model.User;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.repository.SessionParticipantRepository;
import dev.collab3d.repository.SessionRepository;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.SessionContext;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Turns database rows into the two records the policies and handlers work with.
 *
 * <p>It lives in the service layer, not in {@code ws}, because it reads repositories —
 * the WebSocket package is not allowed to. Resolving the context once per frame is the
 * honest cost of keeping the handlers free of lazy JPA proxies; a cache belongs to the
 * later phases, together with the actor coming from the security context.
 *
 * <p>{@code appType} still comes from the configuration: the column that stores it per
 * room arrives with the V2 migration (P1.10).
 */
@Component
@RequiredArgsConstructor
public class SessionContextFactory {

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final SessionOperationRepository operationRepository;
    private final UserRepository userRepository;
    private final Collab3dProperties properties;

    public SessionContext sessionContext(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada: " + sessionId));

        List<Long> active = participantRepository.findBySessionIdOrderByJoinedAtAsc(sessionId).stream()
                .filter(SessionParticipant::isActive)
                .map(participant -> participant.getUser().getId())
                .toList();

        long headSeq = operationRepository.findTopBySessionIdOrderBySeqDesc(sessionId)
                .map(SessionOperation::getSeq)
                .orElse(0L);

        return new SessionContext(sessionId, properties.appType(), session.getStatus(),
                session.getHost().getId(), active, headSeq);
    }

    public Actor actor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userId));
        return new Actor(user.getId(), user.getNickname(), user.getRole());
    }
}
