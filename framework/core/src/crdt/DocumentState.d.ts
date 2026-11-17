import { BaseOperation } from './Operation';
import { DocumentRecord } from './Record';
import { OperationKindRegistry } from './OperationKind';
/**
 * The CRDT of a collaborative document.
 *
 * It is a fold over the operation log and it is domain-free: the meaning of each kind lives in
 * the `OperationKindRegistry` the application passes in. Given the same set of ops it reaches the
 * same state whatever the arrival order, because every write goes through a commutative merge
 * strategy (LWW registers, tombstone set).
 */
export declare class DocumentState<TChange = unknown> {
    private readonly kinds;
    private readonly records;
    constructor(kinds: OperationKindRegistry<TChange>);
    /**
     * Applies one op and returns only the changes that really happened.
     *
     * A kind whose record does not exist may ignore the op (the ordered channel is what makes
     * that safe: an op always arrives after the record it refers to). Property writes on a
     * deleted record are stored but not reported, so a later revive converges on every replica.
     */
    apply(op: BaseOperation): TChange[];
    get(objectId: string): DocumentRecord | undefined;
    all(): IterableIterator<DocumentRecord>;
    /** Rebuilds a state from a log prefix (the timeline uses this on a scratch instance). */
    static replay<TChange>(ops: readonly BaseOperation[], kinds: OperationKindRegistry<TChange>): DocumentState<TChange>;
    private readonly draft;
}
//# sourceMappingURL=DocumentState.d.ts.map