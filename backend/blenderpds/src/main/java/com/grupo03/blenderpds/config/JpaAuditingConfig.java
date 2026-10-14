package com.grupo03.blenderpds.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Habilita a auditoria do Spring Data JPA (ex.: @CreatedDate).
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
