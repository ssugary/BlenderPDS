package dev.collab3d.spi;

import dev.collab3d.model.SessionStatus;
import java.util.List;

/**
 * Snapshot of a room as the policies see it: everything a decision may depend on, read
 * under the session lock so that a policy never decides on stale data.
 *
 * <p>Participants come as a list ordered by {@code joined_at} (not a set) because the
 * order is information: a turn-based game needs to know who is the second player.
 *
 * @param sessionId                the room
 * @param appType                  which application owns the room ({@code design}, ...)
 * @param status                   lifecycle state
 * @param hostId                   who created the room
 * @param participantIdsByJoinOrder active participants, oldest first
 * @param headSeq                  last {@code seq} in the log ({@code 0} when empty)
 */
public record SessionContext(
        long sessionId,
        String appType,
        SessionStatus status,
        long hostId,
        List<Long> participantIdsByJoinOrder,
        long headSeq) {

    public SessionContext {
        participantIdsByJoinOrder = List.copyOf(participantIdsByJoinOrder);
    }

    /** Whether the user currently has a seat in the room. */
    public boolean isParticipant(long userId) {
        return participantIdsByJoinOrder.contains(userId);
    }

    public boolean isHost(long userId) {
        return hostId == userId;
    }
}
