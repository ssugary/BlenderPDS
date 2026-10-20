package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.service.AuthService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

/**
 * Authentication and the HTTP session that carries it.
 *
 * <p>This used to live in {@code AuthController}, which therefore needed a
 * {@link SecurityContextRepository} of its own — an infrastructure dependency in the
 * HTTP adapter. Keeping it in the service layer leaves the controller with a single
 * job: translate the request into a call and the answer into a status code.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    /**
     * Same implementation Spring Security's default repository
     * ({@code DelegatingSecurityContextRepository}) delegates to, so the context stored
     * here is read normally on the following requests.
     */
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    @Override
    public Optional<User> login(String email, String rawPassword,
                                HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, rawPassword));
        } catch (AuthenticationException ex) {
            // 401 without saying why: wrong password, unconfirmed or disabled account.
            return Optional.empty();
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return userService.getByEmail(email);
    }

    @Override
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
