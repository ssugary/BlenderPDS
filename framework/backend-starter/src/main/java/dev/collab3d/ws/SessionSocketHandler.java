package dev.collab3d.ws;

import dev.collab3d.model.SessionParticipant;
import dev.collab3d.sequencer.OperationAppender;
import dev.collab3d.session.SessionContextFactory;
import dev.collab3d.session.SessionEndedEvent;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.InvalidMessageException;
import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.MessageRejectedException;
import dev.collab3d.spi.MessageTypeHandler;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.WsMessageContext;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * The collaboration channel, as a dispatcher: it owns the connection lifecycle (register,
 * roster, leave, close on end) and hands each frame to the handler registered for its
 * {@code type} in the {@link MessageCatalog}.
 *
 * <p>The protocol itself did not change — {@code sync_hello}, {@code sync_ops},
 * {@code presence}, {@code chat}, {@code scene_snapshot}, {@code sync_ack},
 * {@code session_roster} and {@code error} keep their shapes. What changed is that a new
 * frame type no longer means editing this class: it is a {@code MessageTypeHandler} bean.
 *
 * <p>Locking follows the delivery mode: a frame that changes persisted state runs inside
 * the per-session lock (so {@code seq} order and send order are the same), while
 * ephemeral relays and single-connection answers run outside it.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionSocketHandler extends TextWebSocketHandler {

    private final SessionService sessionService;
    private final SessionConnectionRegistry registry;
    private final MessageCatalog catalog;
    private final SessionContextFactory contextFactory;
    private final OperationAppender operationAppender;
    private final WsFrames frames;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession socket) {
        SessionConnection connection = newConnection(socket);
        if (connection == null) {
            return;
        }

        // Presence was already validated and marked during the handshake
        // (SessionHandshakeInterceptor); here we only join the broadcast registry.
        registry.register(connection);
        broadcastRoster(connection.getSessionId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession socket, TextMessage message) {
        SessionConnection connection = connectionFor(socket);
        if (connection == null) {
            return;
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(message.getPayload());
        } catch (JacksonException ex) {
            sendError(connection, "INVALID_MESSAGE");
            return;
        }

        Optional<MessageTypeHandler> handler = catalog.find(root.path("type").asText(""));
        if (handler.isEmpty()) {
            sendError(connection, "UNKNOWN_TYPE");
            return;
        }

        try {
            WsMessageContext ctx = contextFor(connection);
            Runnable run = () -> handler.get().handle(ctx, root);
            if (handler.get().delivery() == Delivery.PERSISTED_OPS) {
                registry.runLocked(connection.getSessionId(), run);
            } else {
                run.run();
            }
        } catch (InvalidOperationException ex) {
            sendError(connection, ex.code());
        } catch (InvalidMessageException | MessageRejectedException ex) {
            sendError(connection, ex.code());
        } catch (RuntimeException ex) {
            // No malformed message may take the whole room down.
            log.warn("Falha ao tratar mensagem da sessão {}: {}", connection.getSessionId(), ex.toString());
            sendError(connection, "INTERNAL_ERROR");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession socket, CloseStatus status) {
        SessionConnection connection = connectionFor(socket);
        if (connection == null) {
            return;
        }

        registry.remove(connection);
        sessionService.leaveSession(connection.getSessionId(), connection.getUserId());
        broadcastRoster(connection.getSessionId());
    }

    /** The host ended the session: drop the connections (after the database commit). */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSessionEnded(SessionEndedEvent event) {
        registry.closeAll(event.sessionId(), CloseStatus.NORMAL);
    }

    /** Everything one frame may need, resolved once and bound to its connection. */
    private WsMessageContext contextFor(SessionConnection connection) {
        SessionContext session = contextFactory.sessionContext(connection.getSessionId());
        Actor actor = contextFactory.actor(connection.getUserId());
        return new WsMessageContext(session, actor, connection.getSocketId(),
                new ConnectionBroadcaster(registry, connection),
                new ConnectionOperationAppender(operationAppender, connection.getSessionId(), actor));
    }

    /** Broadcasts who is in the room right now (connected or not) and what state it is in. */
    private void broadcastRoster(Long sessionId) {
        String status = null;
        try {
            status = sessionService.getById(sessionId).map(session -> session.getStatus().name()).orElse(null);
            java.util.List<SessionParticipant> participants = sessionService.getParticipants(sessionId);
            registry.broadcast(sessionId, frames.roster(sessionId, status, participants).toString(), null);
        } catch (EntityNotFoundException ex) {
            // The room is gone: the connections are on their way out, nothing to announce.
        }
    }

    private void sendError(SessionConnection connection, String code) {
        connection.sendNow(frames.error(code).toString());
    }

    private SessionConnection newConnection(WebSocketSession socket) {
        Object sessionId = socket.getAttributes().get(SessionHandshakeInterceptor.ATTR_SESSION_ID);
        Object userId = socket.getAttributes().get(SessionHandshakeInterceptor.ATTR_USER_ID);
        if (!(sessionId instanceof Long id) || !(userId instanceof Long user)) {
            return null;
        }
        return new SessionConnection(socket, id, user);
    }

    private SessionConnection connectionFor(WebSocketSession socket) {
        Object sessionId = socket.getAttributes().get(SessionHandshakeInterceptor.ATTR_SESSION_ID);
        if (!(sessionId instanceof Long id)) {
            return null;
        }
        return registry.find(id, socket.getId());
    }
}
