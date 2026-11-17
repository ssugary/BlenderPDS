package dev.collab3d.ws.handler;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.spi.AbstractMessageTypeHandler;
import dev.collab3d.spi.Delivery;
import dev.collab3d.spi.WsMessageContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * Chat is ephemeral too (the service keeps no history for now): the server rebuilds the
 * frame from the text it accepted, so no extra field a client invents travels to the
 * others.
 *
 * <p>Blank or oversized text is dropped silently, like the pre-refactor relay.
 */
@Component
@RequiredArgsConstructor
public class ChatRelayHandler extends AbstractMessageTypeHandler {

    private final ObjectMapper objectMapper;
    private final Collab3dProperties properties;

    @Override
    public String type() {
        return "chat";
    }

    @Override
    public Delivery delivery() {
        return Delivery.RELAY_EPHEMERAL;
    }

    @Override
    protected void validate(WsMessageContext ctx, JsonNode root) {
        // Shape checked in execute(): invalid chat is ignored, not answered.
    }

    @Override
    protected void execute(WsMessageContext ctx, JsonNode root) {
        JsonNode text = root.get("text");
        if (text == null || !text.isTextual()) {
            return;
        }

        String value = text.asText();
        if (value.isBlank() || value.length() > properties.ws().maxChatLength()) {
            return;
        }

        ObjectNode frame = objectMapper.createObjectNode();
        frame.put("type", "chat");
        frame.put("text", value);
        ctx.broadcaster().broadcastExcept(ctx.connectionId(), frame);
    }
}
