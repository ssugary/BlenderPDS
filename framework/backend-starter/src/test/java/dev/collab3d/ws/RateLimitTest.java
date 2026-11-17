package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.session.SessionService;
import dev.collab3d.user.UserService;
import java.net.URI;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/** P3.4 acceptance: the frame above the budget is answered with RATE_LIMITED and dropped. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "collab3d.rate-limit.default-per-second=1")
class RateLimitTest {

    private static final String PASSWORD = "senha12345";
    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";

    @LocalServerPort
    private int port;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @MockitoBean
    private EmailService emailService;

    private final StandardWebSocketClient client = new StandardWebSocketClient();
    private WebSocketSession socket;
    private Long host;

    @AfterEach
    void cleanUp() throws Exception {
        if (socket != null && socket.isOpen()) {
            socket.close(CloseStatus.NORMAL);
        }
        Thread.sleep(200);
        if (host != null) {
            try {
                userService.delete(host);
            } catch (RuntimeException ignored) {
                // already gone
            }
        }
    }

    @Test
    void theFrameAboveTheBudgetIsRefusedAndTheConnectionStaysOpen() throws Exception {
        host = userService.register("rate-host", "rate-host@example.com", PASSWORD).getId();
        userService.confirmEmail(host);
        Session session = sessionService.createSession(host);

        Client handler = connect(session.getId());
        socket = handler.socket;

        // Back to back: the bucket has capacity 1, so the second one is above the budget.
        handler.send(new TextMessage("{\"type\":\"chat\",\"text\":\"um\"}"));
        handler.send(new TextMessage("{\"type\":\"chat\",\"text\":\"dois\"}"));
        assertThat(handler.next("error")).contains("RATE_LIMITED");

        // Still open: a frame of another type has its own bucket.
        handler.send(new TextMessage("{\"type\":\"presence\",\"siteId\":\"site-a\"}"));
        assertThat(socket.isOpen()).isTrue();
    }

    @Test
    void aFastDragSendsMoreOpsThanTheBudgetAndNoneIsLost() throws Exception {
        host = userService.register("drag-host", "drag-host@example.com", PASSWORD).getId();
        userService.confirmEmail(host);
        Session session = sessionService.createSession(host);

        Client handler = connect(session.getId());
        socket = handler.socket;

        // 120 frames in a row, well above the 1/s budget of this test: sync_ops is exempt,
        // so every edit must receive its ack and stay in the log.
        int frames = 120;
        for (int i = 1; i <= frames; i++) {
            handler.send(new TextMessage("{\"type\":\"sync_ops\",\"ops\":["
                    + "{\"id\":{\"lamport\":" + i + ",\"siteId\":\"site-a\"},"
                    + "\"author\":\"site-a\",\"deps\":[],\"kind\":\"add_object\","
                    + "\"objectId\":\"drag-" + i + "\",\"geometry\":\"cube\","
                    + "\"transform\":" + MATRIX + ",\"color\":1}]}"));
        }

        assertThat(handler.count("sync_ack", frames)).isEqualTo(frames);
        assertThat(sessionService.getById(session.getId())).isPresent();
    }

    private Client connect(long sessionId) throws Exception {
        Client handler = new Client();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(userService.getById(host).orElseThrow().getEmail(), PASSWORD);
        handler.socket = client.execute(handler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId))
                .get(5, TimeUnit.SECONDS);
        return handler;
    }

    private static final class Client extends TextWebSocketHandler {

        private final BlockingQueue<String> received = new LinkedBlockingQueue<>();
        private WebSocketSession socket;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            this.socket = session;
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            received.add(message.getPayload());
        }

        void send(TextMessage message) throws Exception {
            socket.sendMessage(message);
        }

        int count(String type, int expected) throws InterruptedException {
            int seen = 0;
            long deadline = System.currentTimeMillis() + 20_000;
            while (seen < expected && System.currentTimeMillis() < deadline) {
                String raw = received.poll(2, TimeUnit.SECONDS);
                if (raw == null) {
                    break;
                }
                if (raw.contains("\"type\":\"" + type + "\"")) {
                    seen++;
                }
            }
            return seen;
        }

        String next(String type) throws InterruptedException {
            while (true) {
                String raw = received.poll(2, TimeUnit.SECONDS);
                if (raw == null) {
                    return null;
                }
                if (raw.contains("\"type\":\"" + type + "\"")) {
                    return raw;
                }
            }
        }
    }
}
