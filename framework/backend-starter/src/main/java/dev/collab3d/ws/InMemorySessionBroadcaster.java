package dev.collab3d.ws;

import dev.collab3d.spi.SessionBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import tools.jackson.databind.JsonNode;

/**
 * Default {@link SessionBroadcaster}: everything lives in this JVM.
 *
 * <p>It is enough for one instance and for the course deployment; a second instance
 * would need a broker, which is why the interface exists and the handlers depend on it
 * rather than on {@link SessionConnectionRegistry}.
 */
@Component
@RequiredArgsConstructor
public class InMemorySessionBroadcaster implements SessionBroadcaster {

    private final SessionConnectionRegistry registry;

    @Override
    public void broadcast(Long sessionId, JsonNode frame) {
        registry.broadcast(sessionId, frame.toString(), null);
    }

    @Override
    public void broadcastExcept(Long sessionId, String connectionId, JsonNode frame) {
        registry.broadcast(sessionId, frame.toString(), connectionId);
    }

    @Override
    public void sendTo(Long sessionId, long userId, JsonNode frame) {
        String payload = frame.toString();
        registry.connections(sessionId).stream()
                .filter(connection -> connection.getUserId() == userId)
                .forEach(connection -> connection.send(payload));
    }

    @Override
    public void closeAll(Long sessionId, CloseStatus status) {
        registry.closeAll(sessionId, status);
    }
}
