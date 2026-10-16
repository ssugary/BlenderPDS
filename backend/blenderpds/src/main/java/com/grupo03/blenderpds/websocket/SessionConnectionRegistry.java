package com.grupo03.blenderpds.websocket;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;

/**
 * Who is connected to each session, in the process's memory.
 *
 * <p>Two roles:
 * <ol>
 *   <li>registry of the open connections, for the broadcast and the roster;</li>
 *   <li>a per-session lock: storing an operation and relaying it to the others happen
 *       inside the same {@code synchronized}, so the {@code seq} order and the send
 *       order are the SAME. Without it, an operation that depends on another one
 *       (moving an object created by another participant) could arrive before it and
 *       would be discarded by the client.</li>
 * </ol>
 *
 * <p>Known limitation: in-memory state means a single instance. Scaling horizontally
 * would need a broker/pub-sub in place of this registry.
 */
@Component
public class SessionConnectionRegistry {

    private final Map<Long, Map<String, SessionConnection>> bySession = new ConcurrentHashMap<>();
    private final Map<Long, Object> sessionLocks = new ConcurrentHashMap<>();

    /** Runs the action with the session lock, serialising seq and send. */
    public void runLocked(Long sessionId, Runnable action) {
        Object lock = sessionLocks.computeIfAbsent(sessionId, key -> new Object());
        synchronized (lock) {
            action.run();
        }
    }

    public void register(SessionConnection connection) {
        bySession.computeIfAbsent(connection.getSessionId(), key -> new ConcurrentHashMap<>())
                .put(connection.getSocketId(), connection);
    }

    public void remove(SessionConnection connection) {
        Map<String, SessionConnection> connections = bySession.get(connection.getSessionId());
        if (connections == null) {
            return;
        }
        connections.remove(connection.getSocketId());
        if (connections.isEmpty()) {
            bySession.remove(connection.getSessionId(), connections);
            sessionLocks.remove(connection.getSessionId());
        }
    }

    public SessionConnection find(Long sessionId, String socketId) {
        Map<String, SessionConnection> connections = bySession.get(sessionId);
        return connections == null ? null : connections.get(socketId);
    }

    public List<SessionConnection> connections(Long sessionId) {
        Map<String, SessionConnection> connections = bySession.get(sessionId);
        return connections == null ? List.of() : List.copyOf(connections.values());
    }

    /** Sends to everyone connected, optionally skipping the sender. */
    public void broadcast(Long sessionId, String frame, String exceptSocketId) {
        for (SessionConnection connection : connections(sessionId)) {
            if (exceptSocketId != null && exceptSocketId.equals(connection.getSocketId())) {
                continue;
            }
            connection.send(frame);
        }
    }

    /** The host ended the session: drop everyone. */
    public void closeAll(Long sessionId, CloseStatus status) {
        for (SessionConnection connection : connections(sessionId)) {
            connection.close(status);
        }
    }
}
