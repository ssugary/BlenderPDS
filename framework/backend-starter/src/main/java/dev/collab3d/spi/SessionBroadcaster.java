package dev.collab3d.spi;

import org.springframework.web.socket.CloseStatus;
import tools.jackson.databind.JsonNode;

/**
 * Fan-out of a room's frames (P3.4).
 *
 * <p>The in-memory implementation is the default and the only one in this phase; it
 * exists as an interface so a broker (Redis, a message bus) can replace it without the
 * handlers knowing. Single-instance limitation is documented in the architecture doc.
 */
public interface SessionBroadcaster {

    void broadcast(Long sessionId, JsonNode frame);

    void broadcastExcept(Long sessionId, String connectionId, JsonNode frame);

    void sendTo(Long sessionId, long userId, JsonNode frame);

    void closeAll(Long sessionId, CloseStatus status);
}
