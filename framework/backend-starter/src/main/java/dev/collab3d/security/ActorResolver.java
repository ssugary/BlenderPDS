package dev.collab3d.security;

import dev.collab3d.spi.Actor;

/**
 * Who is acting, always from the authenticated session.
 *
 * <p>It replaces the ids that used to travel in bodies and query strings: a request that
 * is not authenticated cannot produce an actor, so no endpoint can be tricked into
 * writing on somebody else's behalf.
 */
public interface ActorResolver {

    /** @throws org.springframework.security.authentication.AuthenticationCredentialsNotFoundException when unauthenticated */
    Actor current();

    /** The authenticated user's id; the common case. */
    default long currentId() {
        return current().userId();
    }
}
