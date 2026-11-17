package dev.collab3d.spi.defaults;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.model.Role;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.SessionContext;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Only the host replaces the stored snapshot; the size limit is the old 1 MB. */
class HostOnlySnapshotPolicyTest {

    private final HostOnlySnapshotPolicy policy = new HostOnlySnapshotPolicy(1_000_000);
    private final SessionContext ctx = new SessionContext(1L, "design", SessionStatus.ACTIVE, 7L, List.of(7L, 8L), 0L);

    @Test
    void allowsTheHost() {
        assertThat(policy.mayWrite(ctx, new Actor(7L, "host", Role.USER), null)).isTrue();
    }

    @Test
    void refusesAGuest() {
        assertThat(policy.mayWrite(ctx, new Actor(8L, "guest", Role.USER), null)).isFalse();
        assertThat(policy.mayWrite(ctx, null, null)).isFalse();
    }

    @Test
    void exposesTheSizeLimitAndNoCompactionHint() {
        assertThat(policy.maxBytes()).isEqualTo(1_000_000);
        assertThat(policy.compactionThresholdOps()).isEmpty();
    }
}
