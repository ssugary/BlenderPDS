import { LWWRegister } from './LWWRegister';
import { OpId, compareOpId } from './OpId';

/**
 * One entry of the shared document.
 *
 * The shape is deliberately domain-free: `meta` holds values that never change after creation
 * (an object's geometry, for instance), `fields` holds last-writer-wins registers keyed by the
 * application's field name, and the two stamps implement the tombstone set. Nothing here knows
 * what an "object" is; the application's operation kinds decide which fields exist.
 */
export interface DocumentRecord
{
    readonly id: string;
    readonly createdBy: OpId;
    /** Immutable values set when the record is created. */
    readonly meta: ReadonlyMap<string, unknown>;
    /** Last-writer-wins registers, keyed by field name. */
    readonly fields: ReadonlyMap<string, LWWRegister<unknown>>;
    /** Highest `add` stamp seen. */
    addStamp: OpId;
    /** Highest `remove` stamp seen, or null while nothing removed it. */
    removeStamp: OpId | null;
    /** Cache of the tombstone comparison, kept in sync by DocumentState after every apply. */
    deleted: boolean;
}

/**
 * Last-writer-wins merge, as a strategy over one field of a record.
 *
 * A write only lands when its stamp is greater than the one already stored, which is what makes
 * concurrent writes commutative: every replica keeps the same winner whatever the arrival order.
 */
export const LwwStrategy = {
    read<T>(record: DocumentRecord, field: string): LWWRegister<T> | undefined
    {
        return record.fields.get(field) as LWWRegister<T> | undefined;
    },

    value<T>(record: DocumentRecord, field: string): T | undefined
    {
        return LwwStrategy.read<T>(record, field)?.value;
    },

    /** Creates the register on first write; returns whether the stored value actually changed. */
    write<T>(record: DocumentRecord, field: string, value: T, stamp: OpId): boolean
    {
        const fields = record.fields as Map<string, LWWRegister<unknown>>;
        const register = fields.get(field) as LWWRegister<T> | undefined;

        if (!register)
        {
            fields.set(field, new LWWRegister<unknown>(value, stamp));
            return true;
        }

        return register.set(value, stamp);
    }
};

/**
 * Tombstone set: an id is present while its highest add stamp beats its highest remove stamp.
 * The record itself is never dropped, so an operation that arrives late (or an undo that
 * re-adds) still finds it.
 */
export const TombstoneSetStrategy = {
    isPresent(record: DocumentRecord): boolean
    {
        return record.removeStamp === null || compareOpId(record.removeStamp, record.addStamp) <= 0;
    },

    add(record: DocumentRecord, stamp: OpId): void
    {
        if (compareOpId(stamp, record.addStamp) > 0)
            record.addStamp = stamp;

        record.deleted = !TombstoneSetStrategy.isPresent(record);
    },

    remove(record: DocumentRecord, stamp: OpId): void
    {
        if (record.removeStamp === null || compareOpId(stamp, record.removeStamp) > 0)
            record.removeStamp = stamp;

        record.deleted = !TombstoneSetStrategy.isPresent(record);
    }
};

/** The mutable surface an operation kind receives. Kinds never touch three.js or the network. */
export interface DocumentDraft
{
    get(objectId: string): DocumentRecord | undefined;
    create(objectId: string, createdBy: OpId, meta?: Record<string, unknown>): DocumentRecord;
    isPresent(record: DocumentRecord): boolean;
    addToSet(record: DocumentRecord, stamp: OpId): void;
    removeFromSet(record: DocumentRecord, stamp: OpId): void;
    readField<T>(record: DocumentRecord, field: string): T | undefined;
    writeField<T>(record: DocumentRecord, field: string, value: T, stamp: OpId): boolean;
    all(): IterableIterator<DocumentRecord>;
    metaValue<T>(record: DocumentRecord, name: string): T | undefined;
}
