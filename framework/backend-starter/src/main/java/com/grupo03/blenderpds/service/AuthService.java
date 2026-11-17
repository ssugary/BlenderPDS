package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;

/**
 * Login and logout of the SPA, kept apart from the HTTP adapter so the controller does
 * not have to know how the security context is persisted.
 *
 * <p>The context goes into the HTTP session (JSESSIONID), which is what later lets the
 * browser authenticate the WebSocket handshake too: it cannot send headers on the
 * upgrade, but it does send cookies.
 */
public interface AuthService {

    /**
     * Authenticates by e-mail and password and stores the security context in the HTTP
     * session.
     *
     * @return the authenticated user, or empty for wrong credentials, an unconfirmed
     *         account or a disabled one — without saying which, so as not to leak
     *         account state
     */
    Optional<User> login(String email, String rawPassword,
                         HttpServletRequest request, HttpServletResponse response);

    /** Ends the browser's HTTP session (the cookie stops authenticating). */
    void logout(HttpServletRequest request);
}
