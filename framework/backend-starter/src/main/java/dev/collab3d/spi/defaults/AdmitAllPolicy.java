package dev.collab3d.spi.defaults;

import dev.collab3d.spi.Actor;
import dev.collab3d.spi.OperationAdmissionPolicy;
import dev.collab3d.spi.RejectReason;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateView;
import java.util.Optional;
import tools.jackson.databind.JsonNode;

/**
 * The default for a pure-CRDT application: the server does not interpret the scene, so
 * anything that passed validation is admitted. The merge rules live in the clients; the
 * server only orders and stores.
 */
public class AdmitAllPolicy implements OperationAdmissionPolicy {

    @Override
    public Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation, SessionStateView state) {
        return Optional.empty();
    }
}
