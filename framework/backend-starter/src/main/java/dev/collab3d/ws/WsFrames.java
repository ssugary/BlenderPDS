package dev.collab3d.ws;

import dev.collab3d.model.SessionParticipant;
import dev.collab3d.spi.AppendedOperation;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Builds the server-to-client frames in one place, so the dispatcher and the handlers
 * cannot drift apart on field names or order — the client and the characterisation tests
 * both depend on those shapes.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WsFrames {

    private final ObjectMapper objectMapper;

    /** The one error frame: {@code {type:"error", code}}. */
    public ObjectNode error(String code) {
        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "error");
        frame.put("code", code);
        return frame;
    }

    /**
     * Operations in the server's order. The payload goes back exactly as the client sent
     * it, plus the {@code seq} (the client ignores it; it helps debugging).
     */
    public ObjectNode syncOps(List<AppendedOperation> operations) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "sync_ops");
        ArrayNode ops = root.putArray("ops");

        for (AppendedOperation operation : operations) {
            if (operation.operation() instanceof ObjectNode payload) {
                payload.put("seq", operation.seq());
                ops.add(payload);
            } else {
                log.warn("Operação {} com payload que não é objeto, ignorada no envio", operation.seq());
            }
        }
        return root;
    }

    /**
     * The rehydration frame: the stored snapshot, exactly as it was validated and saved.
     * It always precedes the operations after its {@code baseSeq} (P3.3).
     */
    public ObjectNode syncSnapshot(JsonNode snapshot) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "sync_snapshot");
        root.set("snapshot", snapshot);
        return root;
    }

    /** Acknowledges one stored operation to its sender. */
    public ObjectNode ack(AppendedOperation operation) {
        JsonNode id = operation.operation().path("id");
        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "sync_ack");
        frame.put("siteId", id.path("siteId").asText(""));
        frame.put("lamport", id.path("lamport").asLong(0));
        frame.put("seq", operation.seq());
        return frame;
    }

    /** Who is in the room right now (connected or not) and what state the room is in. */
    public ObjectNode roster(Long sessionId, String status, List<SessionParticipant> participants) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "session_roster");
        root.put("sessionId", sessionId);
        if (status != null) {
            root.put("status", status);
        }

        ArrayNode nodes = root.putArray("participants");
        for (SessionParticipant participant : participants) {
            ObjectNode node = nodes.addObject();
            node.put("userId", participant.getUser().getId());
            node.put("nickname", participant.getUser().getNickname());
            node.put("active", participant.isActive());
        }
        return root;
    }
}
