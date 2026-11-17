package dev.collab3d.ws;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.spi.RateLimitPolicy;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Default {@link RateLimitPolicy}: one token bucket per (connection, message type).
 *
 * <p>Per type on purpose: a flood of chat must not silence the {@code sync_ops} of a
 * client that is drawing, and each type can have its own rate through
 * {@code collab3d.rate-limit.per-type}. The capacity equals the rate, so a short burst
 * up to one second is allowed and a sustained loop is not.
 */
@Component
public class TokenBucketRateLimitPolicy implements RateLimitPolicy {

    private static final long NANOS_PER_SECOND = 1_000_000_000L;

    private final Collab3dProperties properties;
    private final LongSupplier nanoTime;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Autowired
    public TokenBucketRateLimitPolicy(Collab3dProperties properties) {
        this(properties, System::nanoTime);
    }

    /** Test seam: a deterministic clock instead of the wall clock. */
    TokenBucketRateLimitPolicy(Collab3dProperties properties, LongSupplier nanoTime) {
        this.properties = properties;
        this.nanoTime = nanoTime;
    }

    @Override
    public boolean allow(String connectionId, String messageType) {
        // Never drop an edit: CRDT operations are outside the budget (they are still bounded
        // by the frame size, and a client cannot create them faster than it sends frames).
        if (properties.rateLimit().exemptTypes().contains(messageType)) {
            return true;
        }

        int rate = properties.rateLimit().perType()
                .getOrDefault(messageType, properties.rateLimit().defaultPerSecond());
        if (rate <= 0) {
            return true;
        }

        Bucket bucket = buckets.computeIfAbsent(connectionId + "|" + messageType,
                key -> new Bucket(rate));
        return bucket.tryConsume(rate, nanoTime.getAsLong());
    }

    @Override
    public void release(String connectionId) {
        buckets.keySet().removeIf(key -> key.startsWith(connectionId + "|"));
    }

    private static final class Bucket {

        private double tokens;
        private long lastNanos;

        private Bucket(int capacity) {
            this.tokens = capacity;
            this.lastNanos = 0L;
        }

        private boolean tryConsume(int rate, long now) {
            if (lastNanos == 0L) {
                lastNanos = now;
            } else {
                double elapsed = (now - lastNanos) / (double) NANOS_PER_SECOND;
                tokens = Math.min(rate, tokens + elapsed * rate);
                lastNanos = now;
            }

            if (tokens < 1.0) {
                return false;
            }
            tokens -= 1.0;
            return true;
        }
    }
}
