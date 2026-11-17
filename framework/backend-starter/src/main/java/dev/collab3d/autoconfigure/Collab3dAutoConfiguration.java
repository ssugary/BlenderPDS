package dev.collab3d.autoconfigure;

import dev.collab3d.repository.UserRepository;
import dev.collab3d.spi.OperationAdmissionPolicy;
import dev.collab3d.spi.SessionCapacityPolicy;
import dev.collab3d.spi.SessionJoinPolicy;
import dev.collab3d.spi.SessionVisibilityPolicy;
import dev.collab3d.spi.SnapshotPolicy;
import dev.collab3d.spi.defaults.AdmitAllPolicy;
import dev.collab3d.spi.defaults.AlwaysVisiblePolicy;
import dev.collab3d.spi.defaults.FixedCapacityPolicy;
import dev.collab3d.spi.defaults.HostFriendJoinPolicy;
import dev.collab3d.spi.defaults.HostOnlySnapshotPolicy;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * The framework's entry point for a Spring Boot application: it binds
 * {@link Collab3dProperties} and brings the starter's beans in.
 *
 * <p>Why a component scan here: the starter is a set of ordinary
 * {@code @Component}/{@code @Service}/{@code @RestController} classes (that is what the
 * controller and WebSocket tests exercise), and listing every one of them as a
 * {@code @Bean} would duplicate the wiring without adding a single testable fact. The
 * scan covers {@code dev.collab3d} and skips this package, so the framework never
 * registers its own auto-configuration twice.
 *
 * <p>The entity and repository packages live in the starter too, so the application
 * only needs its {@code @SpringBootApplication} class — its own package is where the
 * domain-specific beans go.
 */
@AutoConfiguration
@EnableConfigurationProperties(Collab3dProperties.class)
@Import(JpaAuditingConfig.class)
@ComponentScan(
        basePackages = "dev.collab3d",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX, pattern = "dev\\.collab3d\\.autoconfigure\\..*"))
@EntityScan("dev.collab3d.model")
@EnableJpaRepositories("dev.collab3d.repository")
public class Collab3dAutoConfiguration {

    /*
     * The default policies. `@ConditionalOnMissingBean` is what makes an application able
     * to REPLACE a rule (declare a bean of the same type) instead of always adding to it;
     * the chains (List<..Policy>) do add up, one element per bean.
     */

    @Bean
    @ConditionalOnMissingBean
    OperationAdmissionPolicy operationAdmissionPolicy() {
        return new AdmitAllPolicy();
    }

    @Bean
    @ConditionalOnMissingBean
    SnapshotPolicy snapshotPolicy(Collab3dProperties properties) {
        return new HostOnlySnapshotPolicy(properties.snapshot().maxBytes());
    }

    @Bean
    @ConditionalOnMissingBean
    SessionCapacityPolicy sessionCapacityPolicy(Collab3dProperties properties) {
        return new FixedCapacityPolicy(properties.session().maxParticipants());
    }

    @Bean
    @ConditionalOnMissingBean(SessionJoinPolicy.class)
    SessionJoinPolicy sessionJoinPolicy(UserRepository userRepository) {
        return new HostFriendJoinPolicy(userRepository);
    }

    @Bean
    @ConditionalOnMissingBean
    SessionVisibilityPolicy sessionVisibilityPolicy() {
        return new AlwaysVisiblePolicy();
    }
}
