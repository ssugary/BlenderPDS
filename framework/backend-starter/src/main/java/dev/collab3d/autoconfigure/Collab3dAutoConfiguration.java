package dev.collab3d.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
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
}
