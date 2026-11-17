package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.autoconfigure.Collab3dProperties;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** P3.4: the default bucket, with a deterministic clock. */
class TokenBucketRateLimitPolicyTest {

    private long now = 1_000_000_000L;

    private TokenBucketRateLimitPolicy policy(int perSecond, Map<String, Integer> perType) {
        Collab3dProperties properties = new Collab3dProperties("design",
                new Collab3dProperties.Session(4),
                new Collab3dProperties.Sync(200, 1000, 100, 7000),
                new Collab3dProperties.Snapshot(1_000_000),
                new Collab3dProperties.Ws(List.of(), 500),
                new Collab3dProperties.RateLimit(perSecond, perType));
        return new TokenBucketRateLimitPolicy(properties, () -> now);
    }

    @Test
    void allowsTheBurstAndThenRefusesUntilTheBucketRefills() {
        TokenBucketRateLimitPolicy policy = policy(2, Map.of("chat", 2));

        assertThat(policy.allow("conn-1", "chat")).isTrue();
        assertThat(policy.allow("conn-1", "chat")).isTrue();
        assertThat(policy.allow("conn-1", "chat")).isFalse();

        now += 1_000_000_000L / 2;   // half a second → one token
        assertThat(policy.allow("conn-1", "chat")).isTrue();
    }

    @Test
    void bucketsArePerConnectionAndPerType() {
        TokenBucketRateLimitPolicy policy = policy(1, Map.of());

        assertThat(policy.allow("conn-1", "chat")).isTrue();
        assertThat(policy.allow("conn-1", "chat")).isFalse();
        // A different type on the same connection has its own bucket.
        assertThat(policy.allow("conn-1", "presence")).isTrue();
        // A different connection has its own bucket.
        assertThat(policy.allow("conn-2", "chat")).isTrue();
    }

    @Test
    void releaseForgetsTheConnection() {
        TokenBucketRateLimitPolicy policy = policy(1, Map.of());
        assertThat(policy.allow("conn-1", "chat")).isTrue();
        assertThat(policy.allow("conn-1", "chat")).isFalse();

        policy.release("conn-1");
        assertThat(policy.allow("conn-1", "chat")).isTrue();
    }
}
