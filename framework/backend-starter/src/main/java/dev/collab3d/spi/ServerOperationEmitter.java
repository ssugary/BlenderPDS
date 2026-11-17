package dev.collab3d.spi;

import java.util.List;
import tools.jackson.databind.node.ObjectNode;

/**
 * HS1/HS2: lets an authoritative application answer a batch with operations of its own
 * (the winning move ends the game, so the server appends {@code game_over}).
 *
 * <p>Called under the lock, after the client's operations were admitted, persisted and
 * folded into the reduced state.
 */
public interface ServerOperationEmitter {

    List<ObjectNode> followUps(SessionContext ctx, List<AppendedOperation> appended, SessionStateView state);

    default boolean supports(String appType) {
        return true;
    }
}
