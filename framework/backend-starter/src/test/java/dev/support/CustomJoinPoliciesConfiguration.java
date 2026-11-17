package dev.support;

import dev.collab3d.spi.Actor;
import dev.collab3d.spi.JoinDecision;
import dev.collab3d.spi.JoinRequest;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionJoinPolicy;
import dev.collab3d.spi.SessionVisibilityPolicy;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;

/**
 * Replaces the default join rule with "host only" and hides every room from the friends
 * listing, for {@code JoinPolicyTest}.
 *
 * <p>Lives in {@code dev.support} for the reason documented in
 * {@link RejectColorPolicyConfiguration}: anything under {@code dev.collab3d} would be
 * component-scanned into every test context of the starter.
 */
@TestConfiguration(proxyBeanMethods = false)
public class CustomJoinPoliciesConfiguration {

    @Bean
    SessionJoinPolicy hostOnlyPolicy() {
        return new SessionJoinPolicy() {
            @Override
            public JoinDecision decide(SessionContext ctx, Actor joiner, JoinRequest request) {
                return ctx.isHost(joiner.userId())
                        ? JoinDecision.allow()
                        : JoinDecision.deny(HttpStatus.FORBIDDEN, "HOST_ONLY", "Somente o host entra nesta sala");
            }
        };
    }

    @Bean
    SessionVisibilityPolicy hideEverythingPolicy() {
        return (ctx, viewer) -> false;
    }
}
