package com.grupo03.blenderpds.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Turns on Spring Data JPA auditing, so the {@code @CreatedDate} fields (such as
 * {@code User.createdAt}) are filled in on insert instead of being set by hand in
 * every service.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
