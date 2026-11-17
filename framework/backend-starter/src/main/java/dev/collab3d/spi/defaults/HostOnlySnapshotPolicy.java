package dev.collab3d.spi.defaults;

import dev.collab3d.spi.Actor;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SnapshotEnvelope;
import dev.collab3d.spi.SnapshotPolicy;
import java.util.OptionalLong;

/**
 * Only the host writes the stored snapshot, and it never exceeds
 * {@code collab3d.snapshot.max-bytes} (1 MB, the old {@code MAX_SNAPSHOT_BYTES}).
 *
 * <p>Why the host: the snapshot is a periodic materialisation of the whole document. If
 * every replica could replace it, a lagging client would keep overwriting the good one
 * with an older scene. The log stays the source of truth, so missing snapshots only cost
 * catch-up time.
 *
 * <p>No compaction threshold is suggested by default: the client decides when to send
 * one ({@code SyncPolicy.snapshotIntervalMs}).
 */
public class HostOnlySnapshotPolicy implements SnapshotPolicy {

    private final int maxBytes;

    public HostOnlySnapshotPolicy(int maxBytes) {
        if (maxBytes < 1) {
            throw new IllegalArgumentException("maxBytes must be at least 1");
        }
        this.maxBytes = maxBytes;
    }

    @Override
    public boolean mayWrite(SessionContext ctx, Actor actor, SnapshotEnvelope snapshot) {
        return actor != null && ctx.isHost(actor.userId());
    }

    @Override
    public int maxBytes() {
        return maxBytes;
    }

    @Override
    public OptionalLong compactionThresholdOps() {
        return OptionalLong.empty();
    }
}
