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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.stream.LongStream;
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
 * P1.12 acceptance: catch-up on a 10k-operation room.
 *
 * <p>The scan is paged by {@code seq} (the page equals the client's chunk), so a client
 * that already has almost everything receives only the few operations it is missing —
 * the whole log is never materialised to find them. The chunk is small here because the
 * container refuses text frames above ~8 KB, and a page is exactly one
 * {@code sync_ops} frame.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "collab3d.sync.chunk-size=25")
class SyncCatchUpTest {

    private static final int TOTAL_OPS = 10_000;
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
    void aClientThatHasAlmostEverythingReceivesOnlyTheMissingTailOfATenThousandOperationLog()
            throws Exception {
        host = user("catchup-host");
        Session session = sessionService.createSession(host);
        storeOperations(session, TOTAL_OPS);

        // the paged read: ten rows after seq 9990, nothing loaded whole
        assertThat(sessionService.syncSinceSeq(session.getId(), 9_990L, 100))
                .extracting(SessionOperation::getSeq)
                .containsExactlyElementsOf(LongStream.rangeClosed(9_991L, 10_000L).boxed().toList());

        Client hostClient = connect(session.getId(), host);
        // the client already has site-a up to lamport 9995: only 9996..10000 are missing
        hostClient.send(new TextMessage("{\"type\":\"sync_hello\",\"vv\":{\"site-a\":9995}}"));

        String frame = hostClient.next("sync_ops");
        assertThat(frame).isNotNull();
        JsonNode catchUp = objectMapper.readTree(frame);
        assertThat(catchUp.path("ops").size()).isEqualTo(5);
        assertThat(catchUp.path("ops").get(0).path("seq").asLong()).isEqualTo(9_996L);
        assertThat(catchUp.path("ops").get(4).path("seq").asLong()).isEqualTo(10_000L);
    }

    /** Stores the log directly; the point here is the read path, not the append path. */
    private void storeOperations(Session session, int count) {
        int batchSize = 500;
        List<SessionOperation> batch = new ArrayList<>(batchSize);
        for (int i = 1; i <= count; i++) {
            SessionOperation operation = new SessionOperation();
            operation.setSession(session);
            operation.setSeq((long) i);
            operation.setSiteId("site-a");
            operation.setLamport((long) i);
            operation.setKind("add_object");
            operation.setPayload(operation("site-a", i, "obj-" + i));
            batch.add(operation);

            if (batch.size() == batchSize) {
                operationRepository.saveAll(batch);
                batch.clear();
            }
        }
        if (!batch.isEmpty()) {
            operationRepository.saveAll(batch);
        }
    }

    private static String operation(String siteId, long lamport, String objectId) {
        return "{\"id\":{\"lamport\":" + lamport + ",\"siteId\":\"" + siteId + "\"},"
                + "\"author\":\"" + siteId + "\",\"deps\":[],\"kind\":\"add_object\","
                + "\"objectId\":\"" + objectId + "\",\"geometry\":\"cube\","
                + "\"transform\":" + MATRIX + ",\"color\":16711680}";
    }

    private Long user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        userService.confirmEmail(id);
        return id;
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

    /** Minimal client: sends one hello and reads the first {@code sync_ops}. */
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
            for (int i = 0; i < 10; i++) {
                String raw = received.poll(10, TimeUnit.SECONDS);
                if (raw == null) {
                    return null;
                }
                if (raw.contains("\"type\":\"" + type + "\"")) {
                    return raw;
                }
            }
            return null;
        }
    }
}
