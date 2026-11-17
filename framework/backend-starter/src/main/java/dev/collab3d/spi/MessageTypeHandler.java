package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * HS2: one WebSocket frame type. The dispatcher looks the type up in the
 * {@code MessageCatalog} and calls it — adding a type means adding a bean, never editing
 * the dispatcher.
 */
public interface MessageTypeHandler {

    /** The {@code type} field of the frame, e.g. {@code sync_ops}. */
    String type();

    /** Whether it changes persisted state, is ephemeral or only answers the sender. */
    Delivery delivery();

    void handle(WsMessageContext ctx, JsonNode payload);
}
