package com.grupo03.blenderpds.config;

import com.grupo03.blenderpds.websocket.SessionHandshakeInterceptor;
import com.grupo03.blenderpds.websocket.SessionSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Native WebSocket (no STOMP): the client already speaks raw JSON with four message
 * types, so a text handler is the most direct fit and adds no new front-end
 * dependency.
 *
 * <p>The route lives under {@code /ws/**} because the Vite proxy is already set up to
 * upgrade {@code /ws} to the backend in development.
 *
 * <p>It stays under Spring Security's protection (the default is
 * {@code anyRequest().authenticated()}) and the interceptor performs the friendship
 * check.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final SessionSocketHandler sessionSocketHandler;
    private final SessionHandshakeInterceptor sessionHandshakeInterceptor;

    /** Origins of the Vite dev server; without an Origin header (tests, curl) the check passes. */
    @Value("${app.ws.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String[] allowedOriginPatterns;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(sessionSocketHandler, "/ws/sessions/*")
                .addInterceptors(sessionHandshakeInterceptor)
                .setAllowedOriginPatterns(allowedOriginPatterns);
    }
}
