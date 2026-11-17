package dev.collab3d.ws;

import dev.collab3d.spi.Broadcaster;
import tools.jackson.databind.JsonNode;

/**
 * {@link Broadcaster} bound to one connection: {@code reply} reaches the sender,
 * everything else goes through the registry (which knows who is connected and keeps the
 * per-connection queue during catch-up).
 */
public class ConnectionBroadcaster implements Broadcaster {

    private final SessionConnectionRegistry registry;
    private final SessionConnection connection;

    public ConnectionBroadcaster(SessionConnectionRegistry registry, SessionConnection connection) {
        this.registry = registry;
        this.connection = connection;
    }

    @Override
    public void broadcast(JsonNode frame) {
        registry.broadcast(connection.getSessionId(), frame.toString(), null);
    }

    @Override
    public void broadcastExcept(String connectionId, JsonNode frame) {
        registry.broadcast(connection.getSessionId(), frame.toString(), connectionId);
    }

    @Override
    public void sendTo(long userId, JsonNode frame) {
        for (SessionConnection other : registry.connections(connection.getSessionId())) {
            if (other.getUserId() != null && other.getUserId() == userId) {
                other.send(frame.toString());
            }
        }
    }

    @Override
    public void reply(JsonNode frame) {
        connection.sendNow(frame.toString());
    }
}
