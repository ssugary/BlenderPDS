package com.grupo03.blenderpds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the REST + WebSocket backend.
 *
 * <p>{@code @SpringBootApplication} enables component scanning under
 * {@code com.grupo03.blenderpds}, the auto-configuration and the external settings
 * read from {@code application.properties} (datasource, SMTP, session cookie).
 */
@SpringBootApplication
public class BlenderpdsApplication {

	public static void main(String[] args) 
	{
		SpringApplication.run(BlenderpdsApplication.class, args);
	}

}
