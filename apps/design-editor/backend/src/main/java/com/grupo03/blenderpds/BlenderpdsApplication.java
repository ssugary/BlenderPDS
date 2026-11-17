package com.grupo03.blenderpds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the design editor backend: the first application built on the
 * framework.
 *
 * <p>Everything the framework provides (users, rooms, the operation log, the WebSocket
 * channel, the entity and repository packages) arrives through
 * {@code Collab3dAutoConfiguration}; this class only exists so that the app's own
 * {@code com.grupo03.blenderpds} package is scanned for domain beans.
 */
@SpringBootApplication
public class BlenderpdsApplication {

	public static void main(String[] args)
	{
		SpringApplication.run(BlenderpdsApplication.class, args);
	}

}
