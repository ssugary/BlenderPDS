package dev.collab3d.ws;

import dev.collab3d.autoconfigure.Collab3dProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Native WebSocket (no STOMP): the client already speaks raw JSON with a handful of
 * message types, so a text handler is the most direct fit and adds no new front-end
 * dependency.
 *
 * <p>It stays under Spring Security's protection (the default is
 * {@code anyRequest().authenticated()}) and the interceptor performs the friendship
 * check.
 *
 * <p>The accepted origins come from {@code collab3d.ws.allowed-origins} (fed by the
 * {@code WS_ALLOWED_ORIGINS} environment variable); the dev-server defaults are only
 * used when the application configures none. Without an Origin header (tests, tools)
 * the check passes.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private static final String[] DEV_SERVER_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"};

    private final SessionSocketHandler sessionSocketHandler;
    private final SessionHandshakeInterceptor sessionHandshakeInterceptor;
    private final Collab3dProperties properties;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(sessionSocketHandler, "/ws/sessions/*")
                .addInterceptors(sessionHandshakeInterceptor)
                .setAllowedOriginPatterns(allowedOriginPatterns());
    }

    private String[] allowedOriginPatterns() {
        var configured = properties.ws().allowedOrigins();
        return configured == null || configured.isEmpty()
                ? DEV_SERVER_ORIGINS
                : configured.toArray(String[]::new);
    }
}
