package com.grupo03.blenderpds.websocket;

import com.grupo03.blenderpds.model.SessionOperation;
import com.grupo03.blenderpds.model.SessionParticipant;
import com.grupo03.blenderpds.service.SessionEndedEvent;
import com.grupo03.blenderpds.service.SessionOperationInput;
import com.grupo03.blenderpds.service.SessionService;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
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
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * The collaboration channel. It speaks the SAME message protocol the client already
 * used between two WebRTC peers ({@code sync_hello}, {@code sync_ops}, {@code presence},
 * {@code chat}) — what changed is that a sequencer now sits in the middle:
 *
 * <ul>
 *   <li>{@code sync_hello} — the client says what it already has (version vector) and
 *       receives only what is missing, in {@code seq} order;</li>
 *   <li>{@code sync_ops} — local operation: it is validated, gets a {@code seq}, goes
 *       to the database and is relayed to the others (never back to the sender);</li>
 *   <li>{@code scene_snapshot} — the client-materialised scene, stored as a
 *       denormalisation (the operation log remains the source of truth);</li>
 *   <li>{@code presence} and {@code chat} — ephemeral, only relayed (they never reach
 *       the database);</li>
 *   <li>{@code sync_ack}, {@code session_roster} and {@code error} — new messages that
 *       old clients simply ignore (they already filter by {@code type}).</li>
 * </ul>
 *
 * <p>Storing and relaying happen inside the same per-session lock: the {@code seq}
 * order and the delivery order are then identical, and the client's
 * {@code DocumentState} never discards an operation because its object has not
 * arrived yet.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionSocketHandler extends TextWebSocketHandler {

    /** Same chunk size as the client's SyncEngine. */
    private static final int CHUNK_SIZE = 200;

    private static final int MAX_CHAT_LENGTH = 500;
    private static final int MAX_ID_LENGTH = 100;
    private static final int MAX_VERSION_ENTRIES = 100;

    private final SessionService sessionService;
    private final SessionConnectionRegistry registry;
    private final OperationValidator operationValidator;
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

        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            switch (root.path("type").asText("")) {
                case "sync_hello" -> handleHello(connection, root);
                case "sync_ops" -> handleOps(connection, root);
                case "presence" -> relayPresence(connection, root);
                case "chat" -> relayChat(connection, root);
                case "scene_snapshot" -> handleSnapshot(connection, root);
                default -> sendError(connection, "UNKNOWN_TYPE");
            }
        } catch (JacksonException ex) {
            sendError(connection, "INVALID_MESSAGE");
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

    /**
     * Catch-up: sends what is missing to whoever already has the given version vector.
     * It runs under the session lock so that no broadcast interleaves — frames that
     * arrive meanwhile wait in the connection queue (see SessionConnection).
     */
    private void handleHello(SessionConnection connection, JsonNode root) {
        Map<String, Integer> versionVector = readVersionVector(root.get("vv"));

        registry.runLocked(connection.getSessionId(), () -> {
            try {
                List<SessionOperation> missing = sessionService.syncSince(connection.getSessionId(), versionVector);
                for (int i = 0; i < missing.size(); i += CHUNK_SIZE) {
                    connection.sendNow(syncOpsFrame(
                            missing.subList(i, Math.min(missing.size(), i + CHUNK_SIZE))));
                }
            } catch (RuntimeException ex) {
                log.warn("Catch-up falhou na sessão {}: {}", connection.getSessionId(), ex.toString());
                sendError(connection, "SYNC_FAILED");
            } finally {
                // Even when it fails, the connection goes back to receiving live frames.
                connection.finishCatchUp();
            }
        });
    }

    /**
     * Local operation: validate, sequence, store and relay. Inside the lock, from the
     * {@code seq} all the way to the send, so that the delivery order is the log order.
     */
    private void handleOps(SessionConnection connection, JsonNode root) {
        List<SessionOperationInput> inputs = operationValidator.validateBatch(root.get("ops"));
        if (inputs.isEmpty()) {
            sendError(connection, "INVALID_OP");
            return;
        }

        Long sessionId = connection.getSessionId();
        Long userId = connection.getUserId();

        registry.runLocked(sessionId, () -> {
            List<SessionOperation> saved;
            try {
                saved = sessionService.appendOperations(sessionId, userId, inputs);
            } catch (EntityNotFoundException | AccessDeniedException | IllegalStateException ex) {
                // Ended session, participant gone or session deleted: warn and stay alive.
                sendError(connection, "OP_REJECTED");
                return;
            }

            if (saved.isEmpty()) {
                // Everything was already in the log (a reconnect redelivery): nothing to spread.
                return;
            }

            registry.broadcast(sessionId, syncOpsFrame(saved), connection.getSocketId());
            for (SessionOperation operation : saved) {
                connection.sendNow(ackFrame(operation));
            }
        });
    }

    /** Presence is ephemeral: it never reaches the database, only the other connected clients. */
    private void relayPresence(SessionConnection connection, JsonNode root) {
        String siteId = shortString(root.get("siteId"));
        if (siteId == null) {
            return;
        }

        JsonNode selected = root.get("selectedObjectId");
        boolean freeOrValid = selected == null || selected.isNull()
                || (selected.isTextual() && !selected.asText().isEmpty()
                    && selected.asText().length() <= MAX_ID_LENGTH);
        if (!freeOrValid) {
            return;
        }

        registry.broadcast(connection.getSessionId(), root.toString(), connection.getSocketId());
    }

    /** Chat is ephemeral too (the service keeps no history for now). */
    private void relayChat(SessionConnection connection, JsonNode root) {
        JsonNode text = root.get("text");
        if (text == null || !text.isTextual()) {
            return;
        }

        String value = text.asText();
        if (value.isBlank() || value.length() > MAX_CHAT_LENGTH) {
            return;
        }

        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "chat");
        frame.put("text", value);
        registry.broadcast(connection.getSessionId(), frame.toString(), connection.getSocketId());
    }

    /** The materialised scene comes from the client: the server does not compute the CRDT. */
    private void handleSnapshot(SessionConnection connection, JsonNode root) {
        JsonNode snapshot = root.get("snapshot");
        if (snapshot == null || snapshot.isNull()) {
            sendError(connection, "INVALID_SNAPSHOT");
            return;
        }

        try {
            sessionService.saveSnapshot(connection.getSessionId(), connection.getUserId(),
                    objectMapper.writeValueAsString(snapshot));
        } catch (IllegalArgumentException ex) {
            sendError(connection, "SNAPSHOT_TOO_LARGE");
        } catch (JacksonException | EntityNotFoundException | AccessDeniedException ex) {
            sendError(connection, "SNAPSHOT_REJECTED");
        }
    }

    /** Who is in the room right now (connected or not) and what state it is in. */
    private void broadcastRoster(Long sessionId) {
        String frame;
        try {
            frame = rosterFrame(sessionId);
        } catch (EntityNotFoundException ex) {
            return;
        }
        registry.broadcast(sessionId, frame, null);
    }

    private String rosterFrame(Long sessionId) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "session_roster");
        root.put("sessionId", sessionId);

        sessionService.getById(sessionId).ifPresent(session ->
                root.put("status", session.getStatus().name()));

        ArrayNode participants = root.putArray("participants");
        for (SessionParticipant participant : sessionService.getParticipants(sessionId)) {
            ObjectNode node = participants.addObject();
            node.put("userId", participant.getUser().getId());
            node.put("nickname", participant.getUser().getNickname());
            node.put("active", participant.isActive());
        }
        return root.toString();
    }

    private String syncOpsFrame(List<SessionOperation> operations) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "sync_ops");
        ArrayNode ops = root.putArray("ops");

        for (SessionOperation operation : operations) {
            try {
                // The payload goes back as a JSON object, exactly as the client sent it,
                // plus the server's seq (which the client ignores, but helps debugging).
                if (objectMapper.readTree(operation.getPayload()) instanceof ObjectNode payload) {
                    payload.put("seq", operation.getSeq());
                    ops.add(payload);
                }
            } catch (JacksonException ex) {
                log.warn("Operação {} com payload ilegível, ignorada no envio", operation.getId());
            }
        }
        return root.toString();
    }

    private String ackFrame(SessionOperation operation) {
        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "sync_ack");
        frame.put("siteId", operation.getSiteId());
        frame.put("lamport", operation.getLamport());
        frame.put("seq", operation.getSeq());
        return frame.toString();
    }

    private void sendError(SessionConnection connection, String code) {
        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "error");
        frame.put("code", code);
        connection.sendNow(frame.toString());
    }

    private Map<String, Integer> readVersionVector(JsonNode node) {
        if (node == null || !node.isObject() || node.size() > MAX_VERSION_ENTRIES) {
            return Map.of();
        }

        Map<String, Integer> versionVector = new HashMap<>();
        node.properties().forEach(entry -> {
            String siteId = entry.getKey();
            JsonNode value = entry.getValue();
            if (!siteId.isEmpty() && siteId.length() <= MAX_ID_LENGTH
                    && value.isIntegralNumber() && value.asLong() >= 0 && value.asLong() <= Integer.MAX_VALUE) {
                versionVector.put(siteId, value.asInt());
            }
        });
        return versionVector;
    }

    private String shortString(JsonNode node) {
        if (node == null || !node.isTextual()) {
            return null;
        }
        String value = node.asText();
        return value.isEmpty() || value.length() > MAX_ID_LENGTH ? null : value;
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
