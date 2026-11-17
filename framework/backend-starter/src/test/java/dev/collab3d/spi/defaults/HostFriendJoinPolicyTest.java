package dev.collab3d.spi.defaults;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.collab3d.model.Role;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.JoinDecision;
import dev.collab3d.spi.JoinRequest;
import dev.collab3d.spi.SessionContext;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

/** The rule the REST join and the handshake shared before the refactor, kept intact. */
class HostFriendJoinPolicyTest {

    private static final long HOST = 7L;
    private static final long FRIEND = 8L;
    private static final long STRANGER = 9L;

    private final UserRepository userRepository = mock(UserRepository.class);
    private final HostFriendJoinPolicy policy = new HostFriendJoinPolicy(userRepository);
    private final SessionContext active =
            new SessionContext(1L, "design", SessionStatus.ACTIVE, HOST, List.of(HOST), 0L);

    @Test
    void letsTheHostIn() {
        assertThat(policy.decide(active, actor(HOST), JoinRequest.none()).allowed()).isTrue();
    }

    @Test
    void letsAFriendOfTheHostIn() {
        when(userRepository.areFriends(HOST, FRIEND)).thenReturn(true);

        assertThat(policy.decide(active, actor(FRIEND), JoinRequest.none()).allowed()).isTrue();
    }

    @Test
    void refusesAStrangerWith403() {
        JoinDecision denied = policy.decide(active, actor(STRANGER), JoinRequest.none());

        assertThat(denied.allowed()).isFalse();
        assertThat(denied.statusIfDenied()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(denied.code()).isEqualTo("NOT_FRIEND");
    }

    @Test
    void refusesAnEndedRoomWith409EvenForTheHost() {
        SessionContext ended =
                new SessionContext(1L, "design", SessionStatus.ENDED, HOST, List.of(HOST), 0L);

        JoinDecision denied = policy.decide(ended, actor(HOST), JoinRequest.none());

        assertThat(denied.allowed()).isFalse();
        assertThat(denied.statusIfDenied()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(denied.code()).isEqualTo("SESSION_ENDED");
    }

    private Actor actor(long userId) {
        return new Actor(userId, "user" + userId, Role.USER);
    }
}
