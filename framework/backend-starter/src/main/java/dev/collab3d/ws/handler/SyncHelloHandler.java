package dev.collab3d.ws.handler;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.WsMessageContext;
import dev.collab3d.ws.ProtocolLimits;
import dev.collab3d.ws.SessionConnection;
import dev.collab3d.ws.SessionConnectionRegistry;
import dev.collab3d.ws.WsFrames;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/**
 * Catch-up: the client says what it already has (a version vector) and receives only what
 * is missing, in {@code seq} order and in chunks.
 *
 * <p>It runs under the session lock so no broadcast interleaves — frames that arrive
 * meanwhile wait in the connection queue ({@link SessionConnection}) and are flushed by
 * {@code finishCatchUp}, which is what keeps the client from discarding an operation for
 * an object it has not seen yet.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SyncHelloHandler extends AbstractMessageTypeHandler {

    private final SessionService sessionService;
    private final SessionConnectionRegistry registry;
    private final WsFrames frames;
    private final Collab3dProperties properties;

    @Override
    public String type() {
        return "sync_hello";
    }

    @Override
    public Delivery delivery() {
        return Delivery.UNICAST_REPLY;
    }

    @Override
    protected void validate(WsMessageContext ctx, JsonNode root) {
        // A malformed version vector is not an error: it is treated as "I have nothing",
        // exactly like the handshake of a brand-new replica.
    }

    @Override
    protected void execute(WsMessageContext ctx, JsonNode root) {
        SessionConnection connection = registry.find(ctx.session().sessionId(), ctx.connectionId());
        if (connection == null) {
            return;
        }

        Map<String, Integer> versionVector = readVersionVector(root.get("vv"));
        registry.runLocked(ctx.session().sessionId(), () -> {
            try {
                List<SessionOperation> missing = sessionService.syncSince(ctx.session().sessionId(), versionVector);
                int chunkSize = properties.sync().chunkSize();
                for (int i = 0; i < missing.size(); i += chunkSize) {
                    connection.sendNow(frames.syncOps(
                            missing.subList(i, Math.min(missing.size(), i + chunkSize))).toString());
                }
            } catch (RuntimeException ex) {
                log.warn("Catch-up falhou na sessão {}: {}", ctx.session().sessionId(), ex.toString());
                connection.sendNow(frames.error("SYNC_FAILED").toString());
            } finally {
                // Even when it fails, the connection goes back to receiving live frames.
                connection.finishCatchUp();
            }
        });
    }

    /** Keeps only the entries that make sense; the whole node is dropped when it is too big. */
    private Map<String, Integer> readVersionVector(JsonNode node) {
        if (node == null || !node.isObject() || node.size() > properties.sync().maxVersionEntries()) {
            return Map.of();
        }

        Map<String, Integer> versionVector = new HashMap<>();
        node.properties().forEach(entry -> {
            String siteId = entry.getKey();
            JsonNode value = entry.getValue();
            if (!siteId.isEmpty() && siteId.length() <= ProtocolLimits.MAX_ID_LENGTH
                    && value.isIntegralNumber() && value.asLong() >= 0 && value.asLong() <= Integer.MAX_VALUE) {
                versionVector.put(siteId, value.asInt());
            }
        });
        return versionVector;
    }
}
