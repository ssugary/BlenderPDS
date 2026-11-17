package dev.collab3d;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Boot configuration used only by the starter's tests.
 *
 * <p>The starter is a library: it has no {@code @SpringBootApplication} of its own, because the
 * real one lives in the application module ({@code apps/*}). The tests still need a root
 * configuration to boot a context and scan {@code dev.collab3d}, and {@code @SpringBootTest}
 * finds this one by walking up the test packages.
 */
@SpringBootApplication
public class TestApplication {
}
