package dev.collab3d.spi;

import java.util.Optional;
import tools.jackson.databind.JsonNode;

/**
 * HS1: decides, under the session lock, whether an operation may enter the log.
 *
 * <p>The server does not interpret the CRDT by default, so the default policy admits
 * everything that survived validation. A game or an authoritative domain adds a policy
 * that looks at {@link SessionStateView} (whose turn it is, is the cell taken...).
 */
public interface OperationAdmissionPolicy {

    /** {@code Optional.empty()} means admitted. */
    Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation, SessionStateView state);

    default boolean supports(String appType) {
        return true;
    }
}
