import { BaseOperation } from './Operation';
import { OpId } from './OpId';
/** Highest lamport seen per site, e.g. { alice: 12, bob: 7 }. Tells a peer what you already have. */
export type VersionVector = Record<string, number>;
/**
 * Append-only list of every operation, local and remote. This is the timeline.
 * Never edited, never reordered: DocumentState and the timeline scrubber both read from it.
 */
export declare class OpLog<TOp extends BaseOperation = any> {
    private ops;
    private keys;
    private vv;
    /** Returns false if the op is already in the log (duplicate delivery). */
    append(op: TOp): boolean;
    has(id: OpId): boolean;
    /**
     * Everything the other side is missing, given THEIR vector.
     * Relies on each site's ops arriving in order (true on an ordered data channel),
     * and keeps log order so the receiver also gets them in order.
     */
    since(vv: VersionVector): TOp[];
    /** Copy, so callers can't mutate the log's own vector. */
    versionVector(): VersionVector;
    /** For the timeline panel: the log in insertion order. */
    all(): readonly TOp[];
}
//# sourceMappingURL=OpLog.d.ts.map