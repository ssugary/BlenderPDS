package dev.collab3d.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.spi.SessionJoinPolicy;
import dev.collab3d.spi.SessionVisibilityPolicy;
import dev.collab3d.user.UserService;
import dev.support.CustomJoinPoliciesConfiguration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * P1.9 acceptance: an application that replaces the default {@link SessionJoinPolicy}
 * and adds a {@link SessionVisibilityPolicy} gets its rules used by
 * {@code joinSession}, {@code connectParticipant} and the friends listing — without the
 * service knowing them.
 */
@SpringBootTest
@Import(CustomJoinPoliciesConfiguration.class)
class JoinPolicyTest {

    private static final String PASSWORD = "senha12345";

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @MockitoBean
    private EmailService emailService;

    private Long host;
    private Long friend;

    @AfterEach
    void cleanUp() {
        for (Long userId : new Long[] {friend, host}) {
            if (userId == null) {
                continue;
            }
            try {
                userService.delete(userId);
            } catch (RuntimeException ignored) {
                // the test may have deleted it already
            }
        }
    }

    @Test
    void theCustomJoinPolicyReplacesTheDefaultAndTheVisibilityPolicyFiltersTheListing() {
        host = user("policy-host");
        friend = user("policy-friend");
        befriend(host, friend);

        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), host);

        // the default would allow a friend; the custom policy does not
        assertThatThrownBy(() -> sessionService.joinSession(session.getId(), friend))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Somente o host entra nesta sala");

        assertThatThrownBy(() -> sessionService.connectParticipant(session.getId(), friend))
                .isInstanceOf(AccessDeniedException.class);

        // the host still enters through the handshake gate
        assertThat(sessionService.connectParticipant(session.getId(), host).isActive()).isTrue();

        // the room is ACTIVE and hosted by a friend, which the frozen query returns;
        // the custom visibility policy is what removes it from the listing
        assertThat(sessionService.getJoinableSessionsFor(friend)).isEmpty();
    }

    private Long user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        userService.confirmEmail(id);
        return id;
    }

    private void befriend(Long a, Long b) {
        Long requestId = userService.sendFriendRequest(a, b).getId();
        userService.acceptFriendRequest(requestId, b);
    }
}
