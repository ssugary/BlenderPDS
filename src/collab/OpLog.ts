import { Operation } from './Operation';
import { OpId } from './OpId';

/** Highest lamport seen per site, e.g. { alice: 12, bob: 7 }. Tells a peer what you already have. */
export type VersionVector = Record<string, number>;

/**
 * Append-only list of every operation, local and remote. This is the timeline.
 * Never edited, never reordered: DocumentState and the timeline scrubber both read from it.
 */
export class OpLog
{
    private ops: Operation[] = [];
    // TODO: index by opIdKey(id) so has() is O(1) and duplicates are rejected.

    /**
     * Returns false if the op is already in the log (duplicate delivery).
     * TODO: check has(), push, and update the version vector.
     */
    public append(_op: Operation): boolean
    {
        throw new Error('not implemented');
    }

    public has(_id: OpId): boolean
    {
        throw new Error('not implemented');
    }

    /**
     * Everything the other side is missing, given THEIR vector.
     * TODO: filter ops where op.id.lamport > (vv[op.id.siteId] ?? 0).
     */
    public since(_vv: VersionVector): Operation[]
    {
        throw new Error('not implemented');
    }

    public versionVector(): VersionVector
    {
        throw new Error('not implemented');
    }

    /** For the timeline panel: the log in insertion order. */
    public all(): readonly Operation[]
    {
        return this.ops;
    }
}
