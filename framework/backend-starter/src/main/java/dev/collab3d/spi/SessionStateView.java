package dev.collab3d.spi;

import java.util.Optional;

/**
 * Read access to the reduced state of the room (empty when the application declared no
 * {@link SessionStateReducer}). Policies and handlers read it through this interface so
 * they never touch the reducer directly.
 */
public interface SessionStateView {

    <S> Optional<S> get(Class<S> type);
}
