package dev.collab3d.ws.handler;

import dev.collab3d.session.SessionService;
import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.SnapshotEnvelope;
import dev.collab3d.spi.WsMessageContext;
import dev.collab3d.ws.WsFrames;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * The materialised scene comes from the client: the server does not compute the CRDT, it
 * only stores the denormalisation (the log stays the source of truth).
 *
 * <p>The size cap belongs to {@code collab3d.snapshot.max-bytes}; going over it is
 * {@code SNAPSHOT_TOO_LARGE}, and anything the storage refuses is
 * {@code SNAPSHOT_REJECTED}.
 */
@Component
@RequiredArgsConstructor
public class SnapshotHandler extends AbstractMessageTypeHandler {

    private final SessionService sessionService;
    private final ObjectMapper objectMapper;
    private final WsFrames frames;

    @Override
    public String type() {
        return "scene_snapshot";
    }

    @Override
    public Delivery delivery() {
        return Delivery.UNICAST_REPLY;
    }

    @Override
    protected void validate(WsMessageContext ctx, JsonNode root) {
        // A missing snapshot is answered with INVALID_SNAPSHOT from execute().
    }

    @Override
    protected void execute(WsMessageContext ctx, JsonNode root) {
        JsonNode snapshot = root.get("snapshot");
        if (snapshot == null || snapshot.isNull()) {
            ctx.broadcaster().reply(frames.error("INVALID_SNAPSHOT"));
            return;
        }

        try {
            SnapshotEnvelope envelope = objectMapper.treeToValue(snapshot, SnapshotEnvelope.class);
            sessionService.saveSnapshot(ctx.session().sessionId(), ctx.actor().userId(), envelope);
        } catch (IllegalArgumentException ex) {
            ctx.broadcaster().reply(frames.error("SNAPSHOT_TOO_LARGE"));
        } catch (EntityNotFoundException | AccessDeniedException | IllegalStateException ex) {
            ctx.broadcaster().reply(frames.error("SNAPSHOT_REJECTED"));
        }
    }
}
