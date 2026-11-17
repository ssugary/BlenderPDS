package dev;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

/**
 * Boot configuration used only by the starter's tests.
 *
 * <p>The starter is a library: it has no {@code @SpringBootApplication} of its own,
 * because the real one lives in the application module ({@code apps/*}). The tests
 * still need a root configuration, and it must NOT component-scan: the starter's beans
 * arrive through {@code Collab3dAutoConfiguration} (registered by
 * {@code @EnableAutoConfiguration}), exactly as in a real application. Scanning here
 * as well would register the same classes twice.
 *
 * <p>It sits in the {@code dev} package — above {@code dev.collab3d} — so the scan the
 * auto-configuration performs does not see it; {@code @SpringBootTest} finds it by
 * walking up from the test packages.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
public class TestApplication {
}
