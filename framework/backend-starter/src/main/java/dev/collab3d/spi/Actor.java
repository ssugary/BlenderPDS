package dev.collab3d.spi;

import dev.collab3d.model.Role;

/**
 * Who is acting. In the current phase it is built from what the request carries; in
 * Fase 3 it will always come from the {@code SecurityContext} (never from the payload).
 *
 * @param userId   the acting user
 * @param nickname display name, for messages that show who did it
 * @param role     the account's role
 */
public record Actor(long userId, String nickname, Role role) {
}
