package dev.collab3d.spi;

/**
 * HS2: how a frame reaches the participants. A handler never touches a socket: it asks
 * the broadcaster, which is bound to the session (and, for {@link #reply}, to the
 * connection that sent the message).
 */
public interface Broadcaster {

    /** Everyone connected to the room, including the sender. */
    void broadcast(tools.jackson.databind.JsonNode frame);

    /** Everyone but the connection identified by {@code connectionId} (the sender). */
    void broadcastExcept(String connectionId, tools.jackson.databind.JsonNode frame);

    /** Every connection of one user (a user may have the room open in two tabs). */
    void sendTo(long userId, tools.jackson.databind.JsonNode frame);

    /** Only the connection that originated the message. */
    void reply(tools.jackson.databind.JsonNode frame);
}
