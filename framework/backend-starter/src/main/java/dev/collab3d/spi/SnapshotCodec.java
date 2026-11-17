package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * HS6 (optional): lets an application version and migrate the snapshot JSON, so a format
 * change does not invalidate the snapshots already stored.
 */
public interface SnapshotCodec {

    int currentSchemaVersion();

    /** Called on rehydration when the stored snapshot is older than the current version. */
    JsonNode migrate(JsonNode snapshot, int fromVersion);
}
