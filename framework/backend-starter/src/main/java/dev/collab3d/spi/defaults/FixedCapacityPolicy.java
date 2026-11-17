package dev.collab3d.spi.defaults;

import dev.collab3d.spi.SessionCapacityPolicy;
import dev.collab3d.spi.SessionContext;

/**
 * A fixed number of seats, the same for every room. The value comes from
 * {@code collab3d.session.max-participants} (4, which is what the CRDT of the editor
 * copes with well). An application that needs a different number per room declares its
 * own policy.
 */
public class FixedCapacityPolicy implements SessionCapacityPolicy {

    private final int maxParticipants;

    public FixedCapacityPolicy(int maxParticipants) {
        if (maxParticipants < 1) {
            throw new IllegalArgumentException("maxParticipants must be at least 1");
        }
        this.maxParticipants = maxParticipants;
    }

    @Override
    public int maxParticipants(SessionContext ctx) {
        return maxParticipants;
    }
}
