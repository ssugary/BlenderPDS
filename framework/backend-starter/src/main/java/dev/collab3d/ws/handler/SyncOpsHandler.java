package dev.collab3d.ws.handler;

import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.AppendResult;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.WsMessageContext;
import dev.collab3d.ws.WsFrames;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/**
 * Local operations: validate, sequence, store and relay. The dispatcher already holds the
 * session lock for this delivery, so from the {@code seq} assignment to the send the
 * order is fixed — an operation that depends on another one never overtakes it.
 *
 * <p>Rejections come out of the appender as {@code INVALID_OP} (nothing usable in the
 * batch) or {@code OP_REJECTED} (the room refused it) and are answered by the dispatcher.
 */
@Component
@RequiredArgsConstructor
public class SyncOpsHandler extends AbstractMessageTypeHandler {

    private final WsFrames frames;

    @Override
    public String type() {
        return "sync_ops";
    }

    @Override
    public Delivery delivery() {
        return Delivery.PERSISTED_OPS;
    }

    @Override
    protected void validate(WsMessageContext ctx, JsonNode root) {
        // The batch is validated by the appender: an unusable batch is INVALID_OP for the
        // sender, not a protocol error.
    }

    @Override
    protected void execute(WsMessageContext ctx, JsonNode root) {
        AppendResult result = ctx.appender().append(collectOps(root.get("ops")));

        // Admission is per operation: what the room refused is answered with its code
        // (OP_REJECTED by default) and never enters the log.
        result.rejected().forEach(rejected ->
                ctx.broadcaster().reply(frames.error(rejected.reason().code())));

        if (result.accepted().isEmpty()) {
            // Everything was refused or already in the log (a reconnect redelivery): nothing to spread.
            return;
        }

        ctx.broadcaster().broadcastExcept(ctx.connectionId(), frames.syncOps(result.accepted()));
        result.accepted().forEach(operation -> ctx.broadcaster().reply(frames.ack(operation)));
    }

    private List<JsonNode> collectOps(JsonNode ops) {
        List<JsonNode> nodes = new ArrayList<>();
        if (ops != null && ops.isArray()) {
            ops.forEach(nodes::add);
        }
        return nodes;
    }
}
