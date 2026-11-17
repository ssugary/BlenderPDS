package dev.collab3d.session;

/** A participant disconnected/left the room; the row stays so the log keeps its author. */
public record ParticipantLeftEvent(long sessionId, long userId) {
}
