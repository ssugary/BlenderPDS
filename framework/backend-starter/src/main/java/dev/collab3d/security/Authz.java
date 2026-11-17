package dev.collab3d.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Expressions for {@code @PreAuthorize}. Keeping them in a bean means the rule is
 * written once, in Java, instead of repeated in SpEL strings on every route.
 */
@Component("authz")
@RequiredArgsConstructor
public class Authz {

    private final ActorResolver actorResolver;

    /** The route's {id} is the authenticated user. */
    public boolean isSelf(Long id) {
        return id != null && id == actorResolver.currentId();
    }
}
