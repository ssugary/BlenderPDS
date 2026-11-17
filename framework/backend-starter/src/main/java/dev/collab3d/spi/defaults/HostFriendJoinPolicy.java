package dev.collab3d.spi.defaults;

import dev.collab3d.model.SessionStatus;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.JoinDecision;
import dev.collab3d.spi.JoinRequest;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionJoinPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * The pre-refactor rule, unchanged: the host enters their own room and everybody else has
 * to be a friend of the host; an ended room takes nobody.
 *
 * <p>Capacity is NOT here — it is a separate policy, because a game wants the two-checks-
 * and-the-seat-count to be independent decisions.
 */
@RequiredArgsConstructor
public class HostFriendJoinPolicy implements SessionJoinPolicy {

    private final UserRepository userRepository;

    @Override
    public JoinDecision decide(SessionContext ctx, Actor joiner, JoinRequest request) {
        if (ctx.status() == SessionStatus.ENDED) {
            return JoinDecision.deny(HttpStatus.CONFLICT, "SESSION_ENDED", "Sessão encerrada: " + ctx.sessionId());
        }

        if (ctx.isHost(joiner.userId())) {
            return JoinDecision.allow();
        }

        if (!userRepository.areFriends(ctx.hostId(), joiner.userId())) {
            return JoinDecision.deny(HttpStatus.FORBIDDEN, "NOT_FRIEND",
                    "Só amigos do host podem entrar nesta sessão");
        }

        return JoinDecision.allow();
    }
}
