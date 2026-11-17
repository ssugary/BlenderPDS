package dev.collab3d.spi;

/**
 * Per-connection message budget (P3.4).
 *
 * <p>It is a SPI, not a constant in the handler: an application with heavier frames
 * (avatar poses, for instance) can replace the bucket without touching the framework.
 * A refused message is discarded and answered with {@code error{RATE_LIMITED}}; the
 * connection stays open.
 */
public interface RateLimitPolicy {

    /** Whether this message may be handled now. Called once per received frame. */
    boolean allow(String connectionId, String messageType);

    /** Frees the buckets of a closed connection. */
    default void release(String connectionId) {
    }

    default boolean supports(String appType) {
        return true;
    }
}
