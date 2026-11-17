package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.collab3d.mail.EmailService;
import dev.collab3d.model.Session;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.User;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.security.AppUserDetails;
import dev.collab3d.session.SessionService;
import dev.collab3d.user.UserService;
import java.net.URI;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * P3.1 acceptance: the acting user is the authenticated one, and the ids that used to
 * come from the client cannot make anybody act — or be recorded — as somebody else.
 *
 * <p>This class does NOT import the legacy test harness: it goes through the production
 * {@link dev.collab3d.security.SecurityActorResolver}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class IdentitySpoofingTest {

    private static final String PASSWORD = "senha12345";
    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionOperationRepository operationRepository;

    @org.springframework.boot.test.web.server.LocalServerPort
    private int port;

    @MockitoBean
    private EmailService emailService;

    private final StandardWebSocketClient client = new StandardWebSocketClient();
    private final java.util.ArrayList<Long> created = new java.util.ArrayList<>();
    private WebSocketSession socket;

    @AfterEach
    void cleanUp() throws Exception {
        if (socket != null && socket.isOpen()) {
            socket.close(CloseStatus.NORMAL);
        }
        Thread.sleep(250);
        for (Long id : created) {
            try {
                userService.delete(id);
            } catch (RuntimeException ignored) {
                // already gone
            }
        }
    }

    /** Creating a room on behalf of somebody else: 403, and no room is created. */
    @Test
    void createWithSomeoneElsesHostIdIsForbidden() throws Exception {
        User alice = user("alice");
        User bob = user("bob");

        mockMvc.perform(post("/sessions").with(csrf()).with(as(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + bob.getId() + "}"))
                .andExpect(status().isForbidden());

        assertThat(sessionService.getOpenSessionFor(bob.getId())).isEmpty();
        assertThat(sessionService.getOpenSessionFor(alice.getId())).isEmpty();
    }

    /** The socket of somebody else cannot be opened with the legacy query parameter. */
    @Test
    void websocketWithSomeoneElsesUserIdIsForbidden() throws Exception {
        User alice = user("alice");
        User bob = user("bob");
        Session session = sessionService.createSession(alice.getId());

        assertThatThrownBy(() -> connect(session.getId(), alice, bob.getId()))
                .isInstanceOf(ExecutionException.class)
                .satisfies(error -> assertThat(rootMessage(error)).contains("403"));
    }

    /** A profile of another user cannot be edited (nor its e-mail changed). */
    @Test
    void updateOfAnotherUsersProfileIsForbidden() throws Exception {
        User alice = user("alice");
        User bob = user("bob");

        mockMvc.perform(put("/users/" + bob.getId()).with(csrf()).with(as(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"invadido\",\"email\":\"invadido@example.com\"}"))
                .andExpect(status().isForbidden());

        User reloaded = userService.getById(bob.getId()).orElseThrow();
        assertThat(reloaded.getNickname()).isNotEqualTo("invadido");
        assertThat(reloaded.getEmail()).isEqualTo("bob@example.com");
    }

    /**
     * A forged {@code author} is not honoured: the payload is normalised to the sender's
     * replica, and the row's author is the authenticated user.
     */
    @Test
    void forgedAuthorIsPersistedAsTheAuthenticatedActor() throws Exception {
        User alice = user("alice");
        Session session = sessionService.createSession(alice.getId());
        socket = connect(session.getId(), alice, null).socket();

        String forged = """
                {"type":"sync_ops","ops":[{
                  "id":{"lamport":1,"siteId":"site-a"},
                  "author":"mallory",
                  "deps":[],
                  "kind":"add_object",
                  "objectId":"obj-1",
                  "geometry":"cube",
                  "transform":%s,
                  "color":16711680
                }]}""".formatted(MATRIX);
        socket.sendMessage(new TextMessage(forged));

        List<SessionOperation> stored = awaitOperations(session.getId());
        assertThat(stored).hasSize(1);
        SessionOperation operation = stored.getFirst();
        assertThat(operation.getAuthor()).isNotNull();
        assertThat(operation.getAuthor().getId()).isEqualTo(alice.getId());
        assertThat(operation.getPayload()).contains("\"author\":\"site-a\"");
        assertThat(operation.getPayload()).doesNotContain("mallory");
    }

    /** The new contract: no id in the body, the session decides; /open/me answers. */
    @Test
    void createWithoutIdUsesTheAuthenticatedUserAndOpenMeFindsIt() throws Exception {
        User alice = user("alice");

        String response = mockMvc.perform(post("/sessions").with(csrf()).with(as(alice))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hostId").value(alice.getId()))
                .andReturn().getResponse().getContentAsString();

        assertThat(response).contains("\"hostId\":" + alice.getId());

        mockMvc.perform(get("/sessions/open/me").with(as(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hostId").value(alice.getId()));
    }

    // ---------------- helpers ----------------

    private User user(String nickname) {
        Long id = userService.register(nickname, nickname + "@example.com", PASSWORD).getId();
        userService.confirmEmail(id);
        created.add(id);
        return userService.getById(id).orElseThrow();
    }

    private RequestPostProcessor as(User user) {
        AppUserDetails details = AppUserDetails.from(user);
        return authentication(new UsernamePasswordAuthenticationToken(
                details, null, details.getAuthorities()));
    }

    private Client connect(long sessionId, User actor, Long declaredUserId) throws Exception {
        Client handler = new Client();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.setBasicAuth(actor.getEmail(), PASSWORD);
        String query = declaredUserId == null ? "" : "?userId=" + declaredUserId;

        WebSocketSession session = client.execute(handler, headers,
                URI.create("ws://localhost:" + port + "/ws/sessions/" + sessionId + query))
                .get(5, TimeUnit.SECONDS);
        handler.socket = session;
        return handler;
    }

    private List<SessionOperation> awaitOperations(long sessionId) throws InterruptedException {
        for (int attempt = 0; attempt < 40; attempt++) {
            List<SessionOperation> ops = operationRepository
                    .findBySessionIdAndSeqGreaterThanOrderBySeq(sessionId, 0L, PageRequest.of(0, 10));
            if (!ops.isEmpty()) {
                return ops;
            }
            Thread.sleep(100);
        }
        return List.of();
    }

    private String rootMessage(Throwable error) {
        Throwable current = error;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return String.valueOf(current.getMessage());
    }

    /** Minimal socket client: it only needs to stay open and send one frame. */
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

        WebSocketSession socket() {
            return socket;
        }
    }
}
