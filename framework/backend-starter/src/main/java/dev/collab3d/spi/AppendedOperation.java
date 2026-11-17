package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * One operation that made it into the log, with the {@code seq} the server gave it.
 *
 * @param seq       server order
 * @param authorId  sender, or {@code null} for an operation the server itself emitted
 * @param operation the JSON exactly as it was stored
 */
public record AppendedOperation(long seq, Long authorId, JsonNode operation) {
}
