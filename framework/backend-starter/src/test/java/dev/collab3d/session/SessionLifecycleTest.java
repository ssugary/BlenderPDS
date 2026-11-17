package dev.collab3d.session;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.user.UserService;
import dev.support.LifecycleRecorder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * P1.11 acceptance: creating, joining, leaving and ending a room reach a
 * {@link dev.collab3d.spi.SessionLifecycleListener} bean, after the commit.
 *
 * <p>The test is NOT transactional: an {@code AFTER_COMMIT} listener never runs inside a
 * test transaction that is rolled back, which is precisely the property being tested.
 */
@SpringBootTest
@Import(LifecycleRecorder.Configuration.class)
class SessionLifecycleTest {

    private static final String PASSWORD = "senha12345";

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private LifecycleRecorder recorder;

    @MockitoBean
    private EmailService emailService;

    private Long host;
    private Long guest;

    @AfterEach
    void cleanUp() {
        for (Long userId : new Long[] {guest, host}) {
            if (userId == null) {
                continue;
            }
            try {
                userService.delete(userId);
            } catch (RuntimeException ignored) {
                // already deleted by the test (the host's room goes with them)
            }
        }
    }

    @Test
    void everyLifecycleStepReachesTheListener() {
        host = user("lifecycle-host");
        guest = user("lifecycle-guest");
        befriend(host, guest);

        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);
        sessionService.leaveSession(session.getId(), guest);
        sessionService.endSession(session.getId(), host);

        assertThat(recorder.events()).contains(
                "created:" + session.getId() + ":" + host,
                "joined:" + session.getId() + ":" + guest,
                "left:" + session.getId() + ":" + guest,
                "ended:" + session.getId());
    }

    @Test
    void joiningAgainDoesNotFireANewParticipation() {
        host = user("lifecycle-host-2");
        guest = user("lifecycle-guest-2");
        befriend(host, guest);

        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);
        sessionService.joinSession(session.getId(), guest);

        assertThat(recorder.events().stream()
                .filter(event -> event.equals("joined:" + session.getId() + ":" + guest)))
                .hasSize(1);
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
