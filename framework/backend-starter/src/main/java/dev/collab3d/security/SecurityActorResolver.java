package dev.collab3d.security;

import dev.collab3d.model.User;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.spi.Actor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resolves the actor from {@link SecurityContextHolder}. Nothing is read from the
 * request body, the query string or a header.
 *
 * <p>The normal path is {@link AppUserDetails}, which the login stores in the HTTP
 * session. A principal from another authentication mechanism (an embedding app's own
 * provider, a test harness) is mapped through its username → e-mail; if no such account
 * exists the request is treated as unauthenticated instead of guessing.
 */
@Component
@RequiredArgsConstructor
public class SecurityActorResolver implements ActorResolver {

    private final UserRepository userRepository;

    @Override
    public Actor current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("Not authenticated");
        }

        if (authentication.getPrincipal() instanceof AppUserDetails details) {
            return details.toActor();
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Not authenticated"));
        return new Actor(user.getId(), user.getNickname(), user.getRole());
    }
}
