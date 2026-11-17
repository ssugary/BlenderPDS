import { Operation } from './Operation';
import { OpId, opIdKey } from './OpId';

/** Highest lamport seen per site, e.g. { alice: 12, bob: 7 }. Tells a peer what you already have. */
export type VersionVector = Record<string, number>;

/**
 * Append-only list of every operation, local and remote. This is the timeline.
 * Never edited, never reordered: DocumentState and the timeline scrubber both read from it.
 */
export class OpLog
{
    private ops: Operation[] = [];
    private keys = new Set<string>();
    private vv: VersionVector = {};

    /** Returns false if the op is already in the log (duplicate delivery). */
    public append(op: Operation): boolean
    {
        const key = opIdKey(op.id);
        if (this.keys.has(key))
            return false;

        this.keys.add(key);
        this.ops.push(op);
        this.vv[op.id.siteId] = Math.max(this.vv[op.id.siteId] ?? 0, op.id.lamport);
        return true;
    }

    public has(id: OpId): boolean
    {
        return this.keys.has(opIdKey(id));
    }

    /**
     * Everything the other side is missing, given THEIR vector.
     * Relies on each site's ops arriving in order (true on an ordered data channel),
     * and keeps log order so the receiver also gets them in order.
     */
    public since(vv: VersionVector): Operation[]
    {
        return this.ops.filter((op) => op.id.lamport > (vv[op.id.siteId] ?? 0));
    }

    /** Copy, so callers can't mutate the log's own vector. */
    public versionVector(): VersionVector
    {
        return { ...this.vv };
    }

    /** For the timeline panel: the log in insertion order. */
    public all(): readonly Operation[]
    {
        return this.ops;
    }
}
