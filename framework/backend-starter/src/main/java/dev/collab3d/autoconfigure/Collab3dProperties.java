package dev.collab3d.autoconfigure;

import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Every knob the framework exposes, under the {@code collab3d} prefix.
 *
 * <p>It replaces the constants that used to be scattered through the WebSocket handler
 * ({@code CHUNK_SIZE}, {@code MAX_CHAT_LENGTH}, {@code MAX_VERSION_ENTRIES}, the batch
 * cap) and the hard-coded limits of the service ({@code MAX_PARTICIPANTS},
 * {@code MAX_SNAPSHOT_BYTES}). The defaults are exactly the old values, so an
 * application that configures nothing behaves like the pre-refactor backend.
 *
 * <p>Bound by constructor (records); nested groups need {@code @DefaultValue} so that a
 * file that only sets one key still binds the others.
 */
@ConfigurationProperties("collab3d")
public record Collab3dProperties(
        @DefaultValue("design") String appType,
        @DefaultValue Session session,
        @DefaultValue Sync sync,
        @DefaultValue Snapshot snapshot,
        @DefaultValue Ws ws,
        @DefaultValue RateLimit rateLimit) {

    /** Rooms of up to {@code maxParticipants} people, the same cap the CRDT copes with. */
    public record Session(@DefaultValue("4") int maxParticipants) {
    }

    /** Catch-up and batch limits, shared with the client's {@code SyncEngine}. */
    public record Sync(
            @DefaultValue("200") int chunkSize,
            @DefaultValue("1000") int maxOpsPerMessage,
            @DefaultValue("100") int maxVersionEntries) {
    }

    /** The scene snapshot is a denormalisation, not the source of truth: it is capped. */
    public record Snapshot(@DefaultValue("1000000") int maxBytes) {
    }

    /**
     * The origins accepted on the WebSocket handshake. Without an Origin header (tests,
     * tools) the check passes; in production set {@code WS_ALLOWED_ORIGINS}.
     */
    public record Ws(@DefaultValue List<String> allowedOrigins, @DefaultValue("500") int maxChatLength) {
    }

    /** Per-connection message budget (the limiter itself arrives in Fase 3). */
    public record RateLimit(@DefaultValue("50") int defaultPerSecond, @DefaultValue Map<String, Integer> perType) {
    }
}
