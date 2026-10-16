package com.grupo03.blenderpds.websocket;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

/**
 * One WebSocket connection taking part in a collaborative session.
 *
 * <p>It exists because of a correctness detail: {@code DocumentState.apply} on the
 * client DISCARDS an operation for an object it does not know yet. If a movement
 * from another participant arrived in the middle of the newcomer's catch-up, that
 * edit would be lost forever. That is why the connection is born "catching up" and
 * everything that arrives meanwhile stays in a queue, delivered in order right
 * after the initial log finishes.
 *
 * <p>Every send goes through {@code synchronized} methods: the
 * {@link WebSocketSession} is not thread-safe and several threads (one per received
 * message) may want to write at the same time.
 */
@Slf4j
public class SessionConnection {

    private static final int MAX_PENDING_FRAMES = 1_000;

    private final WebSocketSession socket;

    @Getter
    private final Long sessionId;

    @Getter
    private final Long userId;

    private final Deque<String> pending = new ArrayDeque<>();
    private boolean catchingUp = true;

    public SessionConnection(WebSocketSession socket, Long sessionId, Long userId) {
        this.socket = socket;
        this.sessionId = sessionId;
        this.userId = userId;
    }

    public String getSocketId() {
        return socket.getId();
    }

    public boolean isOpen() {
        return socket.isOpen();
    }

    public Long getUserIdAttribute() {
        return userId;
    }

    /** Sends right away, bypassing the queue (used by catch-up and the acks). */
    public synchronized void sendNow(String frame) {
        if (!socket.isOpen()) {
            return;
        }
        try {
            socket.sendMessage(new TextMessage(frame));
        } catch (IOException | IllegalStateException ex) {
            // The connection is dying mid-send: the close follows and cleans everything up.
            log.debug("Falha ao enviar frame para a sessão {}: {}", sessionId, ex.getMessage());
        }
    }

    /** Sends if it is ready; otherwise queues it for after the catch-up. */
    public synchronized void send(String frame) {
        if (catchingUp) {
            if (pending.size() < MAX_PENDING_FRAMES) {
                pending.add(frame);
            }
            return;
        }
        sendNow(frame);
    }

    /** End of catch-up: flushes the queue keeping the arrival order. */
    public synchronized void finishCatchUp() {
        catchingUp = false;
        while (!pending.isEmpty()) {
            sendNow(pending.poll());
        }
    }

    public synchronized void close(CloseStatus status) {
        if (!socket.isOpen()) {
            return;
        }
        try {
            socket.close(status);
        } catch (IOException ex) {
            log.debug("Falha ao fechar a conexão da sessão {}: {}", sessionId, ex.getMessage());
        }
    }
}
