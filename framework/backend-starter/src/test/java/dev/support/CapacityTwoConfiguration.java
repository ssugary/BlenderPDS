package dev.support;

import dev.collab3d.spi.defaults.FixedCapacityPolicy;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * A room of two seats, replacing the default of four, for {@code SessionCapacityDtoTest}.
 *
 * <p>Lives outside {@code dev.collab3d} because the starter's component scan runs over the
 * test classpath too (see {@link RejectColorPolicyConfiguration}).
 */
@TestConfiguration(proxyBeanMethods = false)
public class CapacityTwoConfiguration {

    @Bean
    FixedCapacityPolicy twoSeatsPolicy() {
        return new FixedCapacityPolicy(2);
    }
}
