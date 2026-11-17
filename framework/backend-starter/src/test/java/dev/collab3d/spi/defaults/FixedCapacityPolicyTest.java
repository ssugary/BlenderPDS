package dev.collab3d.spi.defaults;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.collab3d.model.SessionStatus;
import dev.collab3d.spi.SessionContext;
import java.util.List;
import org.junit.jupiter.api.Test;

/** The configured number of seats, the same for every room. */
class FixedCapacityPolicyTest {

    private final SessionContext ctx = new SessionContext(1L, "design", SessionStatus.ACTIVE, 7L, List.of(7L), 0L);

    @Test
    void returnsTheConfiguredLimit() {
        assertThat(new FixedCapacityPolicy(4).maxParticipants(ctx)).isEqualTo(4);
        assertThat(new FixedCapacityPolicy(8).maxParticipants(ctx)).isEqualTo(8);
    }

    @Test
    void rejectsAnImpossibleLimit() {
        assertThatThrownBy(() -> new FixedCapacityPolicy(0)).isInstanceOf(IllegalArgumentException.class);
    }
}
