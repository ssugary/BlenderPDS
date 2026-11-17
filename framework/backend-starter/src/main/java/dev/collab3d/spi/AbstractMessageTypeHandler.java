package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * Template Method for frame handlers: validate the shape, check the permission, do the
 * work. {@link #handle} is final so a handler cannot skip a step by accident; the
 * dispatcher only ever calls it.
 */
public abstract class AbstractMessageTypeHandler implements MessageTypeHandler {

    @Override
    public final void handle(WsMessageContext ctx, JsonNode payload) {
        validate(ctx, payload);
        authorize(ctx, payload);
        execute(ctx, payload);
    }

    protected abstract void validate(WsMessageContext ctx, JsonNode payload);

    protected void authorize(WsMessageContext ctx, JsonNode payload) {
        // Most frames are allowed for any participant; the ones that are not say so.
    }

    protected abstract void execute(WsMessageContext ctx, JsonNode payload);
}
