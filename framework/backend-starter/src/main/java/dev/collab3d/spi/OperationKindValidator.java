package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * HS3: the payload rules of one operation kind ({@code add_object}, {@code place_piece}).
 *
 * <p>It lives in the application, not in the framework: the starter knows no kind
 * literal, so an operation kind that nobody registered is rejected with
 * {@code INVALID_OP} — secure by default.
 */
public interface OperationKindValidator {

    String kind();

    /** @throws InvalidOperationException when the payload does not match the kind */
    void validate(JsonNode operation);
}
