package com.grupo03.blenderpds.service;

/**
 * The host ended the session. The service publishes it and the WebSocket layer listens
 * ({@code @TransactionalEventListener}, after the commit) to drop the open
 * connections — that way the domain never needs to know about sockets.
 */
public record SessionEndedEvent(Long sessionId) {
}
