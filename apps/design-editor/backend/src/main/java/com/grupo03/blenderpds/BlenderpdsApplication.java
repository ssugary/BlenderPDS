package com.grupo03.blenderpds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Entry point of the design editor backend: the first application built on the framework.
 *
 * <p>The application keeps its own package ({@code com.grupo03.blenderpds}) while the reusable
 * code lives in the starter ({@code dev.collab3d}); scanning, entity and repository discovery
 * therefore have to cover both. The starter only owns its auto-configuration from P1.3 on.
 */
@SpringBootApplication
@ComponentScan(basePackages = {"com.grupo03.blenderpds", "dev.collab3d"})
@EntityScan("dev.collab3d.model")
@EnableJpaRepositories("dev.collab3d.repository")
public class BlenderpdsApplication {

	public static void main(String[] args) 
	{
		SpringApplication.run(BlenderpdsApplication.class, args);
	}

}
