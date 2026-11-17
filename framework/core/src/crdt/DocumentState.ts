import { BaseOperation } from './Operation';
import { OpId } from './OpId';
import { LWWRegister } from './LWWRegister';
import {
    DocumentDraft,
    DocumentRecord,
    LwwStrategy,
    TombstoneSetStrategy
} from './Record';
import { OperationKindRegistry } from './OperationKind';

/** Mutable record owned by DocumentState; the public view is the read-only DocumentRecord. */
class Record implements DocumentRecord
{
    public readonly meta = new Map<string, unknown>();
    public readonly fields = new Map<string, LWWRegister<unknown>>();
    public removeStamp: OpId | null = null;
    public deleted = false;

    public constructor(
        public readonly id: string,
        public readonly createdBy: OpId,
        public addStamp: OpId
    )
    {
    }
}

/**
 * Portable form of a whole document: every record's stamps and tombstones included.
 *
 * Without the stamps the merge after a snapshot would diverge, because a late operation
 * could not be compared against what the snapshot already contains.
 */
export interface DocumentSnapshot
{
    /** Bumped when this shape changes; SnapshotCodec migrates older ones. */
    schemaVersion: number;
    records: SerializedRecord[];
}

export interface SerializedRecord
{
    id: string;
    createdBy: OpId;
    addStamp: OpId;
    removeStamp: OpId | null;
    deleted: boolean;
    meta: { [name: string]: unknown };
    fields: { [name: string]: { value: unknown; stamp: OpId } };
}

/**
 * The CRDT of a collaborative document.
 *
 * It is a fold over the operation log and it is domain-free: the meaning of each kind lives in
 * the `OperationKindRegistry` the application passes in. Given the same set of ops it reaches the
 * same state whatever the arrival order, because every write goes through a commutative merge
 * strategy (LWW registers, tombstone set).
 */
export class DocumentState<TChange = unknown>
{
    private readonly records = new Map<string, Record>();

    public constructor(private readonly kinds: OperationKindRegistry<TChange>)
    {
    }

    /**
     * Applies one op and returns only the changes that really happened.
     *
     * A kind whose record does not exist may ignore the op (the ordered channel is what makes
     * that safe: an op always arrives after the record it refers to). Property writes on a
     * deleted record are stored but not reported, so a later revive converges on every replica.
     */
    public apply(op: BaseOperation): TChange[]
    {
        const definition = this.kinds.get(op.kind);
        if (!definition)
            return [];

        // The tombstone strategies keep `record.deleted` current on the record they touch, so no
        // sweep over the whole document is needed here.
        return definition.apply(this.draft, op);
    }

    public get(objectId: string): DocumentRecord | undefined
    {
        return this.records.get(objectId);
    }

    public all(): IterableIterator<DocumentRecord>
    {
        return this.records.values();
    }

    /** Full serialization, stamps and tombstones included (P3.3 rehydration). */
    public toSnapshot(): DocumentSnapshot
    {
        const records: SerializedRecord[] = [];
        for (const record of this.records.values())
        {
            const fields: { [name: string]: { value: unknown; stamp: OpId } } = {};
            for (const [name, register] of record.fields)
                fields[name] = { value: register.value, stamp: register.stamp };

            records.push({
                id: record.id,
                createdBy: record.createdBy,
                addStamp: record.addStamp,
                removeStamp: record.removeStamp,
                deleted: record.deleted,
                meta: Object.fromEntries(record.meta),
                fields
            });
        }
        return { schemaVersion: 1, records };
    }

    /** Replaces the state with a snapshot, keeping the same kinds registry. */
    public restore(snapshot: DocumentSnapshot): void
    {
        this.records.clear();
        for (const serialized of snapshot.records)
        {
            const record = new Record(serialized.id, serialized.createdBy, serialized.addStamp);
            record.removeStamp = serialized.removeStamp;
            record.deleted = serialized.deleted;
            for (const [name, value] of Object.entries(serialized.meta ?? {}))
                record.meta.set(name, value);
            for (const [name, field] of Object.entries(serialized.fields ?? {}))
                record.fields.set(name, new LWWRegister<unknown>(field.value, field.stamp));

            this.records.set(record.id, record);
        }
    }

    /** Rebuilds a state from a snapshot (a brand-new replica rehydrating). */
    public static fromSnapshot<TChange>(
        snapshot: DocumentSnapshot,
        kinds: OperationKindRegistry<TChange>
    ): DocumentState<TChange>
    {
        const state = new DocumentState<TChange>(kinds);
        state.restore(snapshot);
        return state;
    }

    /** Rebuilds a state from a log prefix (the timeline uses this on a scratch instance). */
    public static replay<TChange>(
        ops: readonly BaseOperation[],
        kinds: OperationKindRegistry<TChange>
    ): DocumentState<TChange>
    {
        const state = new DocumentState(kinds);
        for (const op of ops)
            state.apply(op);
        return state;
    }

    private readonly draft: DocumentDraft = {
        get: (objectId) => this.records.get(objectId),

        create: (objectId, createdBy, meta = {}) =>
        {
            const record = new Record(objectId, createdBy, createdBy);
            for (const [name, value] of Object.entries(meta))
                record.meta.set(name, value);

            this.records.set(objectId, record);
            return record;
        },

        isPresent: (record) => TombstoneSetStrategy.isPresent(record),

        addToSet: (record, stamp) => TombstoneSetStrategy.add(record, stamp),

        removeFromSet: (record, stamp) => TombstoneSetStrategy.remove(record, stamp),

        readField: <T>(record: DocumentRecord, field: string) => LwwStrategy.value<T>(record, field),

        writeField: <T>(record: DocumentRecord, field: string, value: T, stamp: OpId) =>
            LwwStrategy.write(record, field, value, stamp),

        all: () => this.records.values(),

        metaValue: <T>(record: DocumentRecord, name: string) => record.meta.get(name) as T | undefined
    };
}
