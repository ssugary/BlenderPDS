package dev.collab3d.session;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.user.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * P1.10: {@code sessions.app_type} exists (V2) and is written from
 * {@code collab3d.app-type}. The test database already had the V1 schema and Flyway
 * history, so a green run is also evidence that the migration applies to an existing
 * database.
 */
@SpringBootTest
class SessionAppTypeTest {

    private static final String PASSWORD = "senha12345";

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @MockitoBean
    private EmailService emailService;

    private Long host;

    @AfterEach
    void cleanUp() {
        if (host != null) {
            userService.delete(host);
        }
    }

    @Test
    void aRoomIsCreatedWithTheConfiguredAppType() {
        host = user("apptype-host");

        Session session = sessionService.createSession(host);

        // the column is NOT NULL with default 'design' (V2), so a wrong default would fail here
        assertThat(session.getAppType()).isEqualTo("design");
        assertThat(sessionService.getById(session.getId()).orElseThrow().getAppType()).isEqualTo("design");
    }

    private Long user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        userService.confirmEmail(id);
        return id;
    }
}
