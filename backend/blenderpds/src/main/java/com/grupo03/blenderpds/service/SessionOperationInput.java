package com.grupo03.blenderpds.service;

/**
 * One client operation, already validated (shape checked at the edge, by the
 * WebSocket's {@code OperationValidator}) and ready to be sequenced.
 *
 * <p>The service layer knows no JSON: it receives this ready to store, which keeps
 * the service testable without assembling payloads and leaves validation in a single
 * place.
 *
 * @param siteId  the replica that produced the operation (the client's Lamport clock siteId)
 * @param lamport the operation's Lamport counter — together with siteId it deduplicates redeliveries
 * @param kind    the operation type (add_object, set_transform, change_color, remove_object)
 * @param payload the raw JSON that goes back to the client exactly as it arrived
 */
public record SessionOperationInput(String siteId, long lamport, String kind, String payload) {
}
