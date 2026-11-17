package dev.collab3d.ws.handler;

import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.WsMessageContext;
import dev.collab3d.ws.ProtocolLimits;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/**
 * Presence (which object a participant has selected) is ephemeral: it never reaches the
 * database, only the other connected clients — that is why it runs outside the session
 * lock.
 *
 * <p>A frame that does not look like presence is DROPPED silently (no error frame): a
 * newer client must not be able to disturb the room with a message the server does not
 * understand, and dropping keeps the old behaviour of this relay.
 */
@Component
public class PresenceRelayHandler extends AbstractMessageTypeHandler {

    @Override
    public String type() {
        return "presence";
    }

    @Override
    public Delivery delivery() {
        return Delivery.RELAY_EPHEMERAL;
    }

    @Override
    protected void validate(WsMessageContext ctx, JsonNode root) {
        // Shape checked in execute(): an invalid presence frame is ignored, not answered.
    }

    @Override
    protected void execute(WsMessageContext ctx, JsonNode root) {
        if (shortString(root.get("siteId")) == null) {
            return;
        }

        JsonNode selected = root.get("selectedObjectId");
        boolean freeOrValid = selected == null || selected.isNull()
                || (selected.isTextual() && !selected.asText().isEmpty()
                    && selected.asText().length() <= ProtocolLimits.MAX_ID_LENGTH);
        if (!freeOrValid) {
            return;
        }

        ctx.broadcaster().broadcastExcept(ctx.connectionId(), root);
    }

    private String shortString(JsonNode node) {
        if (node == null || !node.isTextual()) {
            return null;
        }
        String value = node.asText();
        return value.isEmpty() || value.length() > ProtocolLimits.MAX_ID_LENGTH ? null : value;
    }
}
