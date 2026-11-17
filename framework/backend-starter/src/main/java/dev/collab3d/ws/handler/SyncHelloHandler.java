package dev.collab3d.ws.handler;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.model.SessionOperation;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.AppendedOperation;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.WsMessageContext;
import dev.collab3d.ws.FrameBatcher;
import dev.collab3d.ws.ProtocolLimits;
import dev.collab3d.ws.SessionConnection;
import dev.collab3d.ws.SessionConnectionRegistry;
import dev.collab3d.ws.WsFrames;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

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
    private final ObjectMapper objectMapper;

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
                sendCatchUp(connection, ctx.session().sessionId(), versionVector);
            } catch (RuntimeException ex) {
                log.warn("Catch-up falhou na sessão {}: {}", ctx.session().sessionId(), ex.toString());
                connection.sendNow(frames.error("SYNC_FAILED").toString());
            } finally {
                // Even when it fails, the connection goes back to receiving live frames.
                connection.finishCatchUp();
            }
        });
    }

    /**
     * Sends what the client is missing, one page at a time (P1.12).
     *
     * <p>The scan is paged by {@code seq} with the same size as the client's chunk, so a
     * room with 10k operations never has its log loaded whole: each page is filtered
     * against the version vector, sent as one {@code sync_ops}, and discarded before the
     * next page is read. The author is not part of a {@code sync_ops} frame, so it is not
     * read here (the lazy association is never initialised outside the transaction).
     */
    private void sendCatchUp(SessionConnection connection, Long sessionId, Map<String, Integer> versionVector) {
        int pageSize = Math.max(1, properties.sync().chunkSize());
        long cursor = 0;

        while (true) {
            List<SessionOperation> page = sessionService.syncSinceSeq(sessionId, cursor, pageSize);
            if (page.isEmpty()) {
                return;
            }

            List<AppendedOperation> missing = new ArrayList<>(page.size());
            for (SessionOperation stored : page) {
                if (stored.getLamport() > versionVector.getOrDefault(stored.getSiteId(), 0)) {
                    missing.add(new AppendedOperation(stored.getSeq(), null,
                            objectMapper.readTree(stored.getPayload())));
                }
            }
            // A page can still be too big for one text frame: cut it by bytes before sending.
            for (List<AppendedOperation> frame : FrameBatcher.split(missing,
                    properties.sync().maxOpsPerMessage(),
                    properties.sync().maxFrameBytes(),
                    batch -> frames.syncOps(batch).toString())) {
                connection.sendNow(frames.syncOps(frame).toString());
            }

            cursor = page.getLast().getSeq();
            if (page.size() < pageSize) {
                return;
            }
        }
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
