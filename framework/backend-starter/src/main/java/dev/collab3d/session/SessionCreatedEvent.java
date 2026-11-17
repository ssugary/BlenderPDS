package dev.collab3d.session;

/** A room was created; the host is already registered as an inactive participant. */
public record SessionCreatedEvent(long sessionId, long hostId) {
}
