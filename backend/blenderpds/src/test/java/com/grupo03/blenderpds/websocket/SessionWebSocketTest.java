package com.grupo03.blenderpds.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionOperation;
import com.grupo03.blenderpds.repository.SessionOperationRepository;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.SessionService;
import com.grupo03.blenderpds.service.UserService;
import com.grupo03.blenderpds.service.implementation.SessionServiceImpl;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
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

/**
 * End-to-end collaboration with a real server: two WebSocket clients authenticated
 * by HTTP Basic (the same path the browser's JSESSIONID cookie takes), operations
 * stored/sequenced and the friendship gate on the handshake.
 *
 * <p>It is NOT {@code @Transactional}: the handshake and the messages run on container
 * threads that have to SEE the data — which is why each test cleans up what it
 * created.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SessionWebSocketTest {

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
        // gives the close time to be processed before deleting the data
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
    void hostOperationIsSequencedPersistedAndRelayedToTheGuest() throws Exception {
        Long host = user("ws-host-envia");
        Long guest = user("ws-guest-ve");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);

        Client hostClient = connect(session.getId(), host);
        Client guestClient = connect(session.getId(), guest);

        // the guest asks for the catch-up, as the SyncEngine does when the socket opens
        guestClient.send(hello("{}"));

        hostClient.send(ops(operation("site-a", 1, "obj-1")));

        // 1) the other participant receives the operation, carrying the server's seq
        String relayed = guestClient.next("sync_ops");
        assertThat(relayed).contains("obj-1").contains("\"seq\":1");

        // 2) and it is in the database, in the server's order
        List<SessionOperation> stored = operationRepository.findBySessionIdOrderBySeqAsc(session.getId());
        assertThat(stored).hasSize(1);
        assertThat(stored.getFirst().getSeq()).isEqualTo(1L);
        assertThat(stored.getFirst().getSiteId()).isEqualTo("site-a");
        assertThat(stored.getFirst().getPayload()).contains("\"objectId\":\"obj-1\"");

        // 3) the sender receives the ack (the operation is durable)
        assertThat(hostClient.next("sync_ack")).contains("\"seq\":1");
    }

    @Test
    void lateJoinerGetsOnlyWhatItsVersionVectorIsMissing() throws Exception {
        Long host = user("ws-host-catchup");
        Long guest = user("ws-guest-catchup");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);

        Client hostClient = connect(session.getId(), host);
        // waiting for each ack guarantees the log is already stored before the catch-up
        hostClient.send(ops(operation("site-a", 1, "obj-1")));
        assertThat(hostClient.next("sync_ack")).contains("\"seq\":1");
        hostClient.send(ops(operation("site-a", 2, "obj-2")));
        assertThat(hostClient.next("sync_ack")).contains("\"seq\":2");

        Client late = connect(session.getId(), guest);
        late.send(hello("{\"site-a\":1}"));

        String catchUp = late.next("sync_ops");
        assertThat(catchUp).contains("obj-2").doesNotContain("obj-1");

        // whoever has nothing gets the whole log, in order
        Client fresh = connect(session.getId(), guest);
        fresh.send(hello("{}"));
        String everything = fresh.next("sync_ops");
        assertThat(everything).contains("obj-1").contains("obj-2");
    }

    @Test
    void chatAndPresenceAreRelayedWithoutBeingPersisted() throws Exception {
        Long host = user("ws-host-chat");
        Long guest = user("ws-guest-chat");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.joinSession(session.getId(), guest);

        Client hostClient = connect(session.getId(), host);
        Client guestClient = connect(session.getId(), guest);
        guestClient.send(hello("{}"));

        hostClient.send(new TextMessage("{\"type\":\"chat\",\"text\":\"oi\"}"));
        assertThat(guestClient.next("chat")).contains("oi");

        hostClient.send(new TextMessage("{\"type\":\"presence\",\"siteId\":\"site-a\",\"selectedObjectId\":\"obj-1\"}"));
        assertThat(guestClient.next("presence")).contains("obj-1");

        // ephemeral: none of this becomes an operation in the log
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(session.getId())).isEmpty();
    }

    @Test
    void invalidOperationIsRejectedWithoutKillingTheConnection() throws Exception {
        Long host = user("ws-host-invalida");
        Session session = sessionService.createSession(host);
        Client hostClient = connect(session.getId(), host);
        hostClient.send(hello("{}"));

        // a kind outside the client contract (the front's validate.ts would refuse it too)
        hostClient.send(ops(operation("site-a", 1, "obj-1").replace("add_object", "kind_desconhecido")));

        assertThat(hostClient.next("error")).contains("INVALID_OP");
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(session.getId())).isEmpty();

        // the connection stays alive and accepts a valid operation
        hostClient.send(ops(operation("site-a", 2, "obj-2")));
        assertThat(hostClient.next("sync_ack")).contains("\"seq\":1");
    }

    @Test
    void handshakeRefusesNonFriendsAndFullSessions() throws Exception {
        Long host = user("ws-host-portao");
        Long stranger = user("ws-estranho");
        Session session = sessionService.createSession(host);

        assertThatThrownBy(() -> connect(session.getId(), stranger))
                .isInstanceOf(ExecutionException.class)
                .hasMessageContaining("403");

        // full room: host + 3 guests connected, the fourth one is refused
        int max = SessionServiceImpl.MAX_PARTICIPANTS;
        List<Long> guests = new ArrayList<>();
        for (int i = 0; i < max; i++) {
            Long guest = user("ws-convidado-" + i);
            befriend(host, guest);
            guests.add(guest);
        }

        connect(session.getId(), host);
        for (int i = 0; i < max - 1; i++) {
            connect(session.getId(), guests.get(i));
        }

        Long extra = guests.get(guests.size() - 1);
        assertThatThrownBy(() -> connect(session.getId(), extra))
                .isInstanceOf(ExecutionException.class)
                .hasMessageContaining("409");

        // can the left-out guest still join over REST? no: the room is full
        assertThatThrownBy(() -> sessionService.connectParticipant(session.getId(), extra))
                .isInstanceOf(IllegalStateException.class);
    }

    // ---------------- support ----------------

    private Long user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        // HTTP Basic uses the same UserDetailsService: an unconfirmed account stays disabled
        userService.confirmEmail(id);
        users.add(id);
        return id;
    }

    private void befriend(Long a, Long b) {
        Long requestId = userService.sendFriendRequest(a, b).getId();
        userService.acceptFriendRequest(requestId, b);
    }

    private Client connect(long sessionId, Long userId) throws Exception {
        Client clientHandler = new Client();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(userService.getById(userId).orElseThrow().getEmail(), PASSWORD);

        WebSocketSession socket = this.client
                .execute(clientHandler, headers,
                        URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId + "?userId=" + userId))
                .get(5, TimeUnit.SECONDS);

        sockets.add(socket);
        clientHandler.awaitOpen();
        return clientHandler;
    }

    private static String operation(String siteId, long lamport, String objectId) {
        return "{\"id\":{\"lamport\":" + lamport + ",\"siteId\":\"" + siteId + "\"},"
                + "\"author\":\"" + siteId + "\",\"deps\":[],\"kind\":\"add_object\","
                + "\"objectId\":\"" + objectId + "\",\"geometry\":\"cube\","
                + "\"transform\":" + MATRIX + ",\"color\":16711680}";
    }

    private static TextMessage ops(String... operations) {
        return new TextMessage("{\"type\":\"sync_ops\",\"ops\":[" + String.join(",", operations) + "]}");
    }

    private static TextMessage hello(String versionVector) {
        return new TextMessage("{\"type\":\"sync_hello\",\"vv\":" + versionVector + "}");
    }

    /** Test client: keeps everything that arrives so the test can look for a type. */
    private static final class Client extends TextWebSocketHandler {

        private final BlockingQueue<String> received = new LinkedBlockingQueue<>();
        private final CompletableFuture<Void> opened = new CompletableFuture<>();
        private WebSocketSession socket;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            this.socket = session;
            opened.complete(null);
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            received.add(message.getPayload());
        }

        void awaitOpen() throws Exception {
            opened.get(5, TimeUnit.SECONDS);
        }

        void send(TextMessage message) throws IOException {
            socket.sendMessage(message);
        }

        /** First message of the given type (the roster arrives first and is ignored). */
        String next(String type) throws InterruptedException {
            for (int i = 0; i < 10; i++) {
                String raw = received.poll(5, TimeUnit.SECONDS);
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
