package dev.collab3d.spi;

import java.util.OptionalLong;

/**
 * HS1: who may replace the stored snapshot, how big it may be and when the client should
 * be nudged to send a new one.
 *
 * <p>A snapshot is a denormalisation — the operation log stays the source of truth — so a
 * bad snapshot can always be rebuilt from the log; it is still capped so that one
 * connection cannot push the database out of memory.
 */
public interface SnapshotPolicy {

    boolean mayWrite(SessionContext ctx, Actor actor, SnapshotEnvelope snapshot);

    int maxBytes();

    OptionalLong compactionThresholdOps();

    default boolean supports(String appType) {
        return true;
    }
}
