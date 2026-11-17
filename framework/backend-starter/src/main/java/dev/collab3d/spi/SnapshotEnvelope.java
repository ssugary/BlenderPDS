package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * The scene a client materialised, as it travels on the {@code scene_snapshot} frame.
 *
 * <p>Provisional shape: Fase 3 (P3.3) adds the version vector, the schema version and the
 * checksum and turns this into the rehydration contract. The fields here are the ones the
 * policies already need — which application produced it, up to which {@code seq} it is
 * valid, and the payload itself.
 *
 * @param appType  owner of the room the snapshot belongs to
 * @param baseSeq  last {@code seq} already folded into {@code state}
 * @param state    the client's serialised document
 */
public record SnapshotEnvelope(String appType, long baseSeq, JsonNode state) {
}
