package dev.collab3d.spi;

import java.util.Map;
import tools.jackson.databind.JsonNode;

/**
 * The scene a client materialised, as it travels on {@code scene_snapshot} and is stored
 * for rehydration.
 *
 * <p>It carries the version vector and the base {@code seq}: together they say exactly
 * which prefix of the log the {@code state} already contains, so the server can send the
 * snapshot plus only the operations after it. The checksum (SHA-256 of the canonical
 * {@code state}, object keys sorted) lets the server reject a corrupted or truncated
 * payload instead of storing it.
 *
 * @param schemaVersion current is 1; an older value is migrated by the app's SnapshotCodec
 * @param appType       owner of the room the snapshot belongs to
 * @param baseSeq       last {@code seq} already folded into {@code state}
 * @param versionVector Lamport vector the {@code state} reflects
 * @param state         the client's serialised document, stamps and tombstones included
 * @param checksum      lowercase hex SHA-256 of {@code state}
 */
public record SnapshotEnvelope(
        int schemaVersion,
        String appType,
        long baseSeq,
        Map<String, Integer> versionVector,
        JsonNode state,
        String checksum) {
}
