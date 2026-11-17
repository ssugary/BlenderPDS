package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.session.SessionService;
import dev.collab3d.user.UserService;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * P3.0 acceptance, end to end: a catch-up of large operations arrives in several
 * {@code sync_ops} frames, each below {@code collab3d.sync.max-frame-bytes}, and nothing
 * is lost or reordered.
 *
 * <p>The limit is lowered here so the split happens with few rows; the default (7000) is
 * what protects the ~8 KB container ceiling in production.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "collab3d.sync.chunk-size=100",
        "collab3d.sync.max-frame-bytes=1200"
})
class FrameByteLimitTest {

    private static final int OPS = 60;
    private static final int PADDING = 400;
    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";
    private static final String PASSWORD = "senha12345";

    @LocalServerPort
    private int port;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionOperationRepository operationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmailService emailService;

    private final StandardWebSocketClient client = new StandardWebSocketClient();
    private final List<WebSocketSession> sockets = new ArrayList<>();
    private Long host;

    @AfterEach
    void cleanUp() throws InterruptedException {
        for (WebSocketSession socket : sockets) {
            try {
                socket.close(CloseStatus.NORMAL);
            } catch (IOException ignored) {
                // already closed
            }
        }
        sockets.clear();
        Thread.sleep(250);
        if (host != null) {
            try {
                userService.delete(host);
            } catch (RuntimeException ignored) {
                // already deleted
            }
        }
    }

    @Test
    void catchUpOfLargeOperationsIsSplitByBytesAndLosesNothing() throws Exception {
        host = userService.register("byte-host", "byte-host@example.com", PASSWORD).getId();
        userService.confirmEmail(host);
        Session session = sessionService.createSession(host);
        storeOperations(session);

        Client clientHandler = connect(session.getId(), host);
        clientHandler.send(new TextMessage("{\"type\":\"sync_hello\",\"vv\":{}}"));

        List<Long> received = new ArrayList<>();
        int frames = 0;
        while (received.size() < OPS) {
            String frame = clientHandler.next("sync_ops");
            assertThat(frame).as("catch-up terminou com %d de %d ops", received.size(), OPS).isNotNull();
            frames++;

            assertThat(frame.getBytes(StandardCharsets.UTF_8).length)
                    .as("frame %d", frames)
                    .isLessThanOrEqualTo(1_200);

            JsonNode root = objectMapper.readTree(frame);
            root.path("ops").forEach(op -> received.add(op.path("seq").asLong()));
        }

        assertThat(frames).isGreaterThan(1);
        assertThat(received).containsExactlyElementsOf(
                java.util.stream.LongStream.rangeClosed(1, OPS).boxed().toList());
    }

    /** Stored directly: the append path is not what this test exercises. */
    private void storeOperations(Session session) {
        List<SessionOperation> batch = new ArrayList<>();
        for (int i = 1; i <= OPS; i++) {
            SessionOperation operation = new SessionOperation();
            operation.setSession(session);
            operation.setSeq((long) i);
            operation.setSiteId("site-a");
            operation.setLamport((long) i);
            operation.setKind("add_object");
            operation.setPayload("{\"id\":{\"lamport\":" + i + ",\"siteId\":\"site-a\"},"
                    + "\"author\":\"site-a\",\"deps\":[],\"kind\":\"add_object\","
                    + "\"objectId\":\"obj-" + i + "\",\"geometry\":\"cube\","
                    + "\"padding\":\"" + "x".repeat(PADDING) + "\","
                    + "\"transform\":" + MATRIX + ",\"color\":16711680}");
            batch.add(operation);
        }
        operationRepository.saveAll(batch);
    }

    private Client connect(long sessionId, Long userId) throws Exception {
        Client handler = new Client();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(userService.getById(userId).orElseThrow().getEmail(), PASSWORD);

        WebSocketSession socket = this.client
                .execute(handler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId + "?userId=" + userId))
                .get(5, TimeUnit.SECONDS);

        sockets.add(socket);
        return handler;
    }

    private static final class Client extends TextWebSocketHandler {

        private final BlockingQueue<String> received = new LinkedBlockingQueue<>();
        private WebSocketSession session;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            this.session = session;
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            received.add(message.getPayload());
        }

        void send(TextMessage message) throws IOException {
            session.sendMessage(message);
        }

        String next(String type) throws InterruptedException {
            while (true) {
                String raw = received.poll(10, TimeUnit.SECONDS);
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
