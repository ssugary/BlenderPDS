package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.SnapshotChecksums;
import dev.collab3d.spi.SnapshotEnvelope;
import dev.collab3d.user.UserService;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
import tools.jackson.databind.json.JsonMapper;

/**
 * P3.3 acceptance, end to end: a room with 5k operations and a snapshot whose
 * {@code baseSeq} is 5000 gives a new client the snapshot plus only the operations after
 * 5000 — never the whole log — and a snapshot whose checksum does not match the state is
 * refused.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SnapshotRehydrationTest {

    private static final int OPS = 5_000;
    private static final String PASSWORD = "senha12345";
    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";
    private static final JsonMapper JSON = JsonMapper.builder().build();

    @LocalServerPort
    private int port;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionOperationRepository operationRepository;

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
            } catch (Exception ignored) {
                // already closed
            }
        }
        sockets.clear();
        Thread.sleep(250);
        if (host != null) {
            try {
                userService.delete(host);
            } catch (RuntimeException ignored) {
                // already gone
            }
        }
    }

    @Test
    void newClientGetsSnapshotAndOnlyTheOperationsAfterIt() throws Exception {
        host = userService.register("snapshot-host", "snapshot-host@example.com", PASSWORD).getId();
        userService.confirmEmail(host);
        Session session = sessionService.createSession(host);
        storeOperations(session, OPS);

        JsonNode state = JSON.readTree("{\"objects\":[{\"id\":\"obj-1\",\"geometry\":\"cube\"}]}");
        SnapshotEnvelope envelope = new SnapshotEnvelope(1, "design", OPS,
                Map.of("site-a", OPS), state, SnapshotChecksums.ofState(state));
        sessionService.saveSnapshot(session.getId(), host, envelope);

        // One operation after the snapshot: it is the only one a new client may receive.
        storeOperations(session, OPS + 1, OPS + 1);

        Client clientHandler = connect(session.getId(), host);
        clientHandler.send(new TextMessage("{\"type\":\"sync_hello\",\"vv\":{}}"));

        String snapshotFrame = clientHandler.next("sync_snapshot");
        assertThat(snapshotFrame).isNotNull();
        JsonNode snapshot = JSON.readTree(snapshotFrame).get("snapshot");
        assertThat(snapshot.get("baseSeq").asLong()).isEqualTo(OPS);
        assertThat(snapshot.get("checksum").asString()).isEqualTo(SnapshotChecksums.ofState(state));
        assertThat(snapshot.get("versionVector").get("site-a").asLong()).isEqualTo(OPS);

        String catchUp = clientHandler.next("sync_ops");
        assertThat(catchUp).isNotNull().contains("\"seq\":" + (OPS + 1))
                .doesNotContain("\"seq\":1,");
        assertThat(JSON.readTree(catchUp).get("ops").size()).isEqualTo(1);
    }

    @Test
    void corruptedChecksumIsRejectedAndTheStoredSnapshotDoesNotMove() throws Exception {
        host = userService.register("snapshot-corrupt", "snapshot-corrupt@example.com", PASSWORD).getId();
        userService.confirmEmail(host);
        Session session = sessionService.createSession(host);
        storeOperations(session, 3);

        JsonNode state = JSON.readTree("{\"objects\":[{\"id\":\"obj-1\"}]}");
        SnapshotEnvelope corrupted = new SnapshotEnvelope(1, "design", 3,
                Map.of("site-a", 3), state, "0".repeat(64));

        assertThatThrownBy(() -> sessionService.saveSnapshot(session.getId(), host, corrupted))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Checksum");
        assertThat(sessionService.getSnapshot(session.getId())).isEmpty();

        SnapshotEnvelope valid = new SnapshotEnvelope(1, "design", 2,
                Map.of("site-a", 2), state, SnapshotChecksums.ofState(state));
        sessionService.saveSnapshot(session.getId(), host, valid);

        SnapshotEnvelope older = new SnapshotEnvelope(1, "design", 1,
                Map.of("site-a", 1), state, SnapshotChecksums.ofState(state));
        assertThatThrownBy(() -> sessionService.saveSnapshot(session.getId(), host, older))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("atrás");
    }

    private void storeOperations(Session session, int count) {
        storeOperations(session, 1, count);
    }

    private void storeOperations(Session session, int from, int to) {
        List<SessionOperation> batch = new ArrayList<>();
        for (int i = from; i <= to; i++) {
            SessionOperation operation = new SessionOperation();
            operation.setSession(session);
            operation.setSeq((long) i);
            operation.setSiteId("site-a");
            operation.setLamport((long) i);
            operation.setKind("add_object");
            operation.setPayload("{\"id\":{\"lamport\":" + i + ",\"siteId\":\"site-a\"},"
                    + "\"author\":\"site-a\",\"deps\":[],\"kind\":\"add_object\","
                    + "\"objectId\":\"obj-" + i + "\",\"geometry\":\"cube\","
                    + "\"transform\":" + MATRIX + ",\"color\":1}");
            batch.add(operation);
        }
        operationRepository.saveAll(batch);
        operationRepository.flush();
    }

    private Client connect(long sessionId, Long userId) throws Exception {
        Client handler = new Client();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(userService.getById(userId).orElseThrow().getEmail(), PASSWORD);

        WebSocketSession socket = client.execute(handler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId))
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

        void send(TextMessage message) throws Exception {
            session.sendMessage(message);
        }

        String next(String type) throws InterruptedException {
            while (true) {
                String raw = received.poll(15, TimeUnit.SECONDS);
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
