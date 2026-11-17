package dev.collab3d.session;

/**
 * A user started participating in a room (through the REST join or, for the host, the
 * first handshake). Marking an existing participant as connected is presence, not a
 * new join.
 */
public record ParticipantJoinedEvent(long sessionId, long userId) {
}
