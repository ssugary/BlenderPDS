package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.session.SessionService;
import dev.collab3d.user.UserService;
import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * P3.1: the socket is authenticated by the session cookie alone.
 *
 * <p>This is the path the browser takes through the Vite proxy: no headers can be set on
 * a WebSocket upgrade by JavaScript, but the browser sends the JSESSIONID cookie. The
 * test logs in over real HTTP, keeps the cookie jar, and upgrades with nothing but that
 * cookie — no {@code ?userId=}, no Authorization header.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SessionCookieHandshakeTest {

    private static final String PASSWORD = "senha12345";

    @LocalServerPort
    private int port;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @MockitoBean
    private EmailService emailService;

    private final StandardWebSocketClient wsClient = new StandardWebSocketClient();
    private final HttpClient http = HttpClient.newBuilder()
            .cookieHandler(new CookieManager())
            .build();
    private WebSocketSession socket;
    private Long userId;

    @AfterEach
    void cleanUp() throws Exception {
        if (socket != null && socket.isOpen()) {
            socket.close(CloseStatus.NORMAL);
        }
        Thread.sleep(250);
        if (userId != null) {
            try {
                userService.delete(userId);
            } catch (RuntimeException ignored) {
                // already gone
            }
        }
    }

    @Test
    void upgradeWithOnlyTheSessionCookieConnects() throws Exception {
        userId = userService.register("cookie-host", "cookie-host@example.com", PASSWORD).getId();
        userService.confirmEmail(userId);
        Session session = sessionService.createSession(userId);

        login(userId);
        String cookies = cookieHeader();

        VaadinLikeHandler handler = new VaadinLikeHandler();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.add("Cookie", cookies);
        socket = wsClient.execute(handler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + session.getId()))
                .get(5, TimeUnit.SECONDS);

        assertThat(socket.isOpen()).isTrue();
        assertThat(sessionService.getParticipants(session.getId()))
                .anySatisfy(participant -> {
                    assertThat(participant.getUser().getId()).isEqualTo(userId);
                    assertThat(participant.isActive()).isTrue();
                });
    }

    private void login(long id) throws Exception {
        String email = userService.getById(id).orElseThrow().getEmail();

        HttpResponse<String> csrf = http.send(HttpRequest.newBuilder(
                        URI.create("http://localhost:" + port + "/auth/csrf")).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(csrf.statusCode()).isEqualTo(200);

        String token = csrf.body().replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
        String headerName = csrf.body().replaceAll(".*\"headerName\":\"([^\"]+)\".*", "$1");

        HttpResponse<String> login = http.send(HttpRequest.newBuilder(
                                URI.create("http://localhost:" + port + "/auth/login"))
                        .header("Content-Type", "application/json")
                        .header(headerName, token)
                        .POST(HttpRequest.BodyPublishers.ofString(
                                "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        assertThat(login.statusCode()).isEqualTo(200);
    }

    private String cookieHeader() {
        CookieManager manager = (CookieManager) http.cookieHandler().orElseThrow();
        return manager.getCookieStore().getCookies().stream()
                .map(cookie -> cookie.getName() + "=" + cookie.getValue())
                .reduce((a, b) -> a + "; " + b)
                .orElseThrow();
    }

    private static final class VaadinLikeHandler extends TextWebSocketHandler {
    }
}
