package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * HS3: a validation step in the chain that runs before any handler (ordered with
 * {@code @Order}; the first rejection stops the frame).
 */
public interface MessageValidator {

    boolean supports(String messageType);

    void validate(SessionContext ctx, Actor actor, JsonNode payload);
}
