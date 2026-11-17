package dev.collab3d.sequencer;

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
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
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

/**
 * P1.7 acceptance: two connections appending 500 operations each, concurrently, must
 * leave one contiguous {@code seq} (1..1000) and no duplicated {@code (siteId, lamport)}.
 *
 * <p>It is an end-to-end test on purpose: the lock lives in the sequencer but the race
 * only exists when two sockets write at the same time, which is what the browser does.
 * Batches are small because the container refuses text frames above ~8 KB (see
 * {@code SessionWebSocketTest#textFrameAboveTheContainerBufferClosesTheConnection}).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SequencerConcurrencyTest {

    private static final int OPS_PER_CONNECTION = 500;
    private static final int BATCH = 20;
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

    @MockitoBean
    private EmailService emailService;

    private final StandardWebSocketClient client = new StandardWebSocketClient();
    private final List<WebSocketSession> sockets = new ArrayList<>();
    private final List<Long> users = new ArrayList<>();

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
        for (Long userId : users) {
            try {
                userService.delete(userId);
            } catch (RuntimeException ignored) {
                // the test may have dropped the user already
            }
        }
        users.clear();
    }

    @Test
    void twoConnectionsAppendingFiveHundredOperationsEachKeepSeqContiguousAndUnique() throws Exception {
        Long host = user("seq-host");
        Long guest = user("seq-guest");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);

        Socket hostSocket = connect(session.getId(), host);
        Socket guestSocket = connect(session.getId(), guest);

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> first = pool.submit(sendAll(hostSocket, "site-a"));
            Future<?> second = pool.submit(sendAll(guestSocket, "site-b"));
            first.get(60, TimeUnit.SECONDS);
            second.get(60, TimeUnit.SECONDS);
        } finally {
            pool.shutdownNow();
        }

        List<SessionOperation> stored = awaitOperations(session.getId(), OPS_PER_CONNECTION * 2);

        assertThat(stored).hasSize(OPS_PER_CONNECTION * 2);
        assertThat(stored.stream().map(SessionOperation::getSeq).toList())
                .containsExactlyElementsOf(LongStream.rangeClosed(1, OPS_PER_CONNECTION * 2L).boxed().toList());
        assertThat(stored.stream().map(operation -> operation.getSiteId() + ":" + operation.getLamport())
                .distinct()
                .count()).isEqualTo(OPS_PER_CONNECTION * 2L);
    }

    private Callable<Void> sendAll(Socket socket, String siteId) {
        return () -> {
            for (int sent = 0; sent < OPS_PER_CONNECTION; sent += BATCH) {
                socket.send(batch(siteId, sent + 1, BATCH));
            }
            return null;
        };
    }

    /** The appends are asynchronous; wait until the log holds every operation. */
    private List<SessionOperation> awaitOperations(Long sessionId, int expected) throws InterruptedException {
        List<SessionOperation> stored = List.of();
        for (int attempt = 0; attempt < 120; attempt++) {
            stored = operationRepository.findBySessionIdOrderBySeqAsc(sessionId);
            if (stored.size() >= expected) {
                return stored;
            }
            Thread.sleep(250);
        }
        return stored;
    }

    private static TextMessage batch(String siteId, int firstLamport, int count) {
        StringBuilder frame = new StringBuilder("{\"type\":\"sync_ops\",\"ops\":[");
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                frame.append(',');
            }
            frame.append(operation(siteId, firstLamport + i, "obj-" + siteId + "-" + (firstLamport + i)));
        }
        frame.append("]}");
        return new TextMessage(frame.toString());
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
        users.add(id);
        return id;
    }

    private void befriend(Long a, Long b) {
        Long requestId = userService.sendFriendRequest(a, b).getId();
        userService.acceptFriendRequest(requestId, b);
    }

    private Socket connect(long sessionId, Long userId) throws Exception {
        Socket handler = new Socket();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(userService.getById(userId).orElseThrow().getEmail(), PASSWORD);

        WebSocketSession socket = this.client
                .execute(handler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId + "?userId=" + userId))
                .get(5, TimeUnit.SECONDS);

        sockets.add(socket);
        return handler;
    }

    /** Minimal client: these tests only need to send, never to read frames. */
    private static final class Socket extends TextWebSocketHandler {

        private WebSocketSession session;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            this.session = session;
        }

        void send(TextMessage message) throws IOException {
            session.sendMessage(message);
        }
    }
}
