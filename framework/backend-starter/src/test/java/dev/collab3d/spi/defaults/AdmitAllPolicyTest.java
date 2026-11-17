package dev.collab3d.spi.defaults;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.model.Role;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.SessionContext;
import java.util.List;
import org.junit.jupiter.api.Test;

/** The default must never get in the way: a pure-CRDT app admits everything. */
class AdmitAllPolicyTest {

    private final AdmitAllPolicy policy = new AdmitAllPolicy();
    private final SessionContext ctx = new SessionContext(1L, "design", SessionStatus.ACTIVE, 7L, List.of(7L, 8L), 3L);
    private final Actor actor = new Actor(8L, "ana", Role.USER);

    @Test
    void admitsAnyOperation() {
        assertThat(policy.admit(ctx, actor, null, null)).isEmpty();
    }

    @Test
    void acceptsEveryApplicationType() {
        assertThat(policy.supports("design")).isTrue();
        assertThat(policy.supports("turn-game")).isTrue();
    }
}
