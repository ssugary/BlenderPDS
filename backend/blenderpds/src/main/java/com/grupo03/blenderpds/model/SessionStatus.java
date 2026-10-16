package com.grupo03.blenderpds.model;

/**
 * Lifecycle of a collaborative session.
 *
 * <ul>
 *   <li>{@code WAITING} — created, but no participant connected. It does not show as
 *       "hosting" to friends, yet it still accepts joins.</li>
 *   <li>{@code ACTIVE} — at least one participant connected. This is the state the
 *       friend list shows as "hosting" (the host is actually in the room).</li>
 *   <li>{@code ENDED} — ended by the host. Terminal state: nobody else is accepted
 *       and the open connections are dropped.</li>
 * </ul>
 */
public enum SessionStatus {

    WAITING,
    ACTIVE,
    ENDED
}
