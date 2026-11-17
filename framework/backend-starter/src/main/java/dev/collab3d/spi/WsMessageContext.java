package dev.collab3d.spi;

/**
 * Everything a handler needs about one incoming frame: the room, who sent it, which
 * connection it came from, how to answer the room and how to append operations.
 *
 * @param session      the room, read under the lock
 * @param actor        the sender
 * @param connectionId the sending connection (for {@code broadcastExcept})
 * @param broadcaster  delivery, already bound to the room and to this connection
 * @param appender     the only door into the operation log
 */
public record WsMessageContext(
        SessionContext session,
        Actor actor,
        String connectionId,
        Broadcaster broadcaster,
        SessionOperationAppender appender) {
}
