package dev.support;

import dev.collab3d.spi.Actor;
import dev.collab3d.spi.OperationAdmissionPolicy;
import dev.collab3d.spi.RejectReason;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateView;
import java.util.Optional;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import tools.jackson.databind.JsonNode;

/**
 * A fake admission policy that refuses one kind, for {@code AdmissionPolicyTest}.
 *
 * <p>It sits in {@code dev.support}, outside {@code dev.collab3d}, on purpose: the
 * starter's auto-configuration scans {@code dev.collab3d} on the whole test classpath,
 * so a {@code @TestConfiguration} declared in that package becomes a bean of <em>every</em>
 * context in the suite. Keeping test configurations outside the scanned tree is what
 * makes them local to the test that imports them.
 */
@TestConfiguration(proxyBeanMethods = false)
public class RejectColorPolicyConfiguration {

    @Bean
    OperationAdmissionPolicy rejectColors() {
        return new OperationAdmissionPolicy() {
            @Override
            public Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation,
                    SessionStateView state) {
                String kind = operation.path("kind").isTextual()
                        ? operation.path("kind").asString()
                        : "";
                return "change_color".equals(kind)
                        ? Optional.of(RejectReason.of("OP_REJECTED", "cor bloqueada pela política"))
                        : Optional.empty();
            }
        };
    }
}
