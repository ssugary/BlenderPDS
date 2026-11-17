package dev.collab3d.spi;

/**
 * HS5: who sees a room in the listings (the friends screen today). Visibility is not
 * permission: a room can be visible and still refuse the join, or hidden and joinable by
 * code.
 */
public interface SessionVisibilityPolicy {

    boolean visibleTo(SessionContext ctx, Actor viewer);

    default boolean supports(String appType) {
        return true;
    }
}
