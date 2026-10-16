package com.grupo03.blenderpds.websocket;

import com.grupo03.blenderpds.service.SessionService;
import jakarta.persistence.EntityNotFoundException;
import java.net.URI;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * The WebSocket gate: it runs BEFORE the upgrade, so a connection from somebody who
 * is not a friend of the host never even opens.
 *
 * <p>The validation (and the presence marking) is a single transaction, with the
 * session row locked: without it two simultaneous handshakes could both see the room
 * as having a free seat and go past the participant limit.
 *
 * <p>The user comes in the query ({@code ?userId=}) and the session in the path, the
 * same convention as the REST routes — once there is a real login in the domain,
 * swapping in the authenticated principal is one line here.
 */
@Component
@RequiredArgsConstructor
public class SessionHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_SESSION_ID = "sessionId";
    public static final String ATTR_USER_ID = "userId";

    private static final String PATH_PREFIX = "/ws/sessions/";

    private final SessionService sessionService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Long sessionId = parseSessionId(request.getURI());
        Long userId = parseUserId(request.getURI());

        if (sessionId == null || userId == null) {
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return false;
        }

        try {
            sessionService.connectParticipant(sessionId, userId);
        } catch (EntityNotFoundException ex) {
            response.setStatusCode(HttpStatus.NOT_FOUND);
            return false;
        } catch (AccessDeniedException ex) {
            // Not a friend of the host: the connection is refused here, not later.
            response.setStatusCode(HttpStatus.FORBIDDEN);
            return false;
        } catch (IllegalStateException ex) {
            response.setStatusCode(HttpStatus.CONFLICT);
            return false;
        }

        attributes.put(ATTR_SESSION_ID, sessionId);
        attributes.put(ATTR_USER_ID, userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // Nothing to do after the upgrade: presence goes in through connectParticipant
        // and leaving through SessionSocketHandler.afterConnectionClosed.
    }

    private Long parseSessionId(URI uri) {
        String path = uri.getPath();
        if (path == null || !path.startsWith(PATH_PREFIX)) {
            return null;
        }
        String raw = path.substring(PATH_PREFIX.length());
        int slash = raw.indexOf('/');
        if (slash >= 0) {
            raw = raw.substring(0, slash);
        }
        return parseLong(raw);
    }

    private Long parseUserId(URI uri) {
        String raw = UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("userId");
        return parseLong(raw);
    }

    private Long parseLong(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(raw.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
