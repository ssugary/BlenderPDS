import { LWWRegister } from './LWWRegister';
import { OpId } from './OpId';
/**
 * One entry of the shared document.
 *
 * The shape is deliberately domain-free: `meta` holds values that never change after creation
 * (an object's geometry, for instance), `fields` holds last-writer-wins registers keyed by the
 * application's field name, and the two stamps implement the tombstone set. Nothing here knows
 * what an "object" is; the application's operation kinds decide which fields exist.
 */
export interface DocumentRecord {
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
export declare const LwwStrategy: {
    read<T>(record: DocumentRecord, field: string): LWWRegister<T> | undefined;
    value<T>(record: DocumentRecord, field: string): T | undefined;
    /** Creates the register on first write; returns whether the stored value actually changed. */
    write<T>(record: DocumentRecord, field: string, value: T, stamp: OpId): boolean;
};
/**
 * Tombstone set: an id is present while its highest add stamp beats its highest remove stamp.
 * The record itself is never dropped, so an operation that arrives late (or an undo that
 * re-adds) still finds it.
 */
export declare const TombstoneSetStrategy: {
    isPresent(record: DocumentRecord): boolean;
    add(record: DocumentRecord, stamp: OpId): void;
    remove(record: DocumentRecord, stamp: OpId): void;
};
/** The mutable surface an operation kind receives. Kinds never touch three.js or the network. */
export interface DocumentDraft {
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
//# sourceMappingURL=Record.d.ts.map