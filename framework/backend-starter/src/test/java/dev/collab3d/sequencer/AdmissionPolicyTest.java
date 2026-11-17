package dev.collab3d.sequencer;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.OperationAdmissionPolicy;
import dev.collab3d.spi.RejectReason;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateView;
import dev.collab3d.user.UserService;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;

/**
 * P1.8 acceptance: a fake policy that refuses one kind makes that operation come back as
 * {@code error{OP_REJECTED}} and leaves no row behind, while the rest of the batch keeps
 * working. The policy sees the room through {@link SessionContext} and
 * {@link SessionStateView}, exactly as an application's would.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(AdmissionPolicyTest.RejectColorPolicy.class)
class AdmissionPolicyTest {

    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";
    private static final String PASSWORD = "senha12345";

    @TestConfiguration
    static class RejectColorPolicy {

        @Bean
        OperationAdmissionPolicy rejectColors() {
            return new OperationAdmissionPolicy() {
                @Override
                public Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation,
                        SessionStateView state) {
                    String kind = operation.path("kind").isTextual()
                            ? operation.path("kind").asString()
                            : "";
                    return "change_color".equals(kind)
                            ? Optional.of(RejectReason.of("OP_REJECTED", "cor bloqueada pela política"))
                            : Optional.empty();
                }
            };
        }
    }

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
                // already deleted
            }
        }
        users.clear();
    }

    @Test
    void aPolicyRejectionBecomesOpRejectedAndIsNotPersisted() throws Exception {
        Long host = user("admit-host");
        Session session = sessionService.createSession(host);
        Client hostClient = connect(session.getId(), host);

        hostClient.send(ops(changeColor("site-a", 1, "obj-1")));
        assertThat(hostClient.next("error")).contains("OP_REJECTED");
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(session.getId())).isEmpty();

        // the same connection keeps working: only the refused kind is blocked
        hostClient.send(ops(addObject("site-a", 2, "obj-2")));
        assertThat(hostClient.next("sync_ack")).contains("\"seq\":1");
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(session.getId())).hasSize(1);
    }

    private static String changeColor(String siteId, long lamport, String objectId) {
        return "{\"id\":{\"lamport\":" + lamport + ",\"siteId\":\"" + siteId + "\"},"
                + "\"author\":\"" + siteId + "\",\"deps\":[],\"kind\":\"change_color\","
                + "\"objectId\":\"" + objectId + "\",\"color\":16711680}";
    }

    private static String addObject(String siteId, long lamport, String objectId) {
        return "{\"id\":{\"lamport\":" + lamport + ",\"siteId\":\"" + siteId + "\"},"
                + "\"author\":\"" + siteId + "\",\"deps\":[],\"kind\":\"add_object\","
                + "\"objectId\":\"" + objectId + "\",\"geometry\":\"cube\","
                + "\"transform\":" + MATRIX + ",\"color\":16711680}";
    }

    private static TextMessage ops(String operation) {
        return new TextMessage("{\"type\":\"sync_ops\",\"ops\":[" + operation + "]}");
    }

    private Long user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        userService.confirmEmail(id);
        users.add(id);
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

    /** Minimal client: sends frames and looks for the first one of a type. */
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
