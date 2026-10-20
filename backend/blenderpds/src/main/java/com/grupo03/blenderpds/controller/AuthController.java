package com.grupo03.blenderpds.controller;

import com.grupo03.blenderpds.dto.LoginDto;
import com.grupo03.blenderpds.dto.UserDto;
import com.grupo03.blenderpds.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The SPA's login. It exists because the browser needs something it can send on its
 * own: no browser API can put headers on a WebSocket handshake, but the browser does
 * send the session cookie automatically — including on the upgrade to {@code /ws/**}.
 *
 * <p>The authentication itself and the context stored in the HTTP session (JSESSIONID)
 * live in {@link AuthService}; here only the request/response translation remains.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Hands out the CSRF token and, while resolving it, writes the {@code XSRF-TOKEN}
     * cookie (not httpOnly, so the SPA can read it and echo it in {@code X-XSRF-TOKEN}).
     * The front-end calls this at boot, before any POST.
     */
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    /**
     * Authenticates by e-mail and password and returns the session's user.
     * 401 for wrong credentials, an unconfirmed account or a disabled one — without
     * saying which, so as not to leak account state.
     */
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginDto body,
                                        HttpServletRequest request,
                                        HttpServletResponse response) {
        return authService.login(body.email(), body.password(), request, response)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /** Ends the browser's HTTP session (the cookie stops authenticating). */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
