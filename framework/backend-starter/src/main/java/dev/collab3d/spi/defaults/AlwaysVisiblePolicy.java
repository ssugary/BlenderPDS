package dev.collab3d.spi.defaults;

import dev.collab3d.spi.Actor;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionVisibilityPolicy;

/**
 * The pre-refactor listing rule: a room is visible if it got into the list at all.
 *
 * <p>Today that list is already restricted by the frozen query — only the caller's
 * friends' {@code ACTIVE} rooms are selected — so there is nothing left for the default
 * policy to hide. An application that wants a stricter view (for instance, only rooms
 * it can still enter) adds its own policy; the chain keeps every element that agrees.
 */
public class AlwaysVisiblePolicy implements SessionVisibilityPolicy {

    @Override
    public boolean visibleTo(SessionContext ctx, Actor viewer) {
        return true;
    }
}
