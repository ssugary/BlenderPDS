package dev.collab3d.spi;

import java.util.List;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * HS1: the only door into the operation log. Handlers call it instead of the service, so
 * sequencing, deduplication, persistence, admission and the server's follow-up
 * operations stay in one place.
 */
public interface SessionOperationAppender {

    /**
     * Client operations: the {@code author} is overwritten with the authenticated actor,
     * {@code seq} is assigned and redeliveries are dropped.
     */
    AppendResult append(List<JsonNode> ops);

    /**
     * Operations the server itself emits (a {@code game_over}, for instance). They get
     * {@code id = {siteId:"server", lamport:seq}} and no author, pass through the kind
     * validators, and do NOT go through the admission policy.
     */
    AppendResult appendSystem(List<ObjectNode> ops);
}
