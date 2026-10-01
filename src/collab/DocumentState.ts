import { Operation } from './Operation';
import { LWWRegister } from './LWWRegister';
import { OpId, compareOpId } from './OpId';

/** What the shared model knows about one object. No three.js here, only plain data. */
export interface ObjectRecord
{
    id: string;
    geometry: string;//placeholder for basic shapes
    //cube, pill, sphere, torus, etc
    createdBy: OpId;
    /** Tombstone: keep the record so late ops for this id don't crash, and so undo can revive it. */
    deleted: boolean;
    /** Highest add_object / remove_object stamps seen. The object is alive when the add is newer than the remove. */
    addStamp: OpId;
    removeStamp: OpId | null;
    transform: LWWRegister<number[]>;
    /** Set when the object is created. Nothing changes it afterwards, so it needs no register. */
    color: number;
}

/** What apply() reports back, so SceneProjector only touches what actually changed. */
export type Change =
    | { type: 'added'; objectId: string }
    | { type: 'removed'; objectId: string }
    | { type: 'transform'; objectId: string };

/**
 * The CRDT. Given the same set of ops it ends in the same state, whatever the arrival order.
 * It is the source of truth, and the three.js scene is just a view of it.
 */
export class DocumentState
{
    private objects = new Map<string, ObjectRecord>();

    /**
     * Applies one op and returns only the changes that really happened.
     * Property writes are stored even while an object is deleted (just not reported), so a later
     * revive (undo of a delete) ends in the same state on every replica whatever the arrival order.
     * An op for an unknown objectId is dropped: this relies on each site's ops arriving in order,
     * which the ordered data channel guarantees for two peers.
     */
    public apply(op: Operation): Change[]
    {
        switch (op.kind)
        {
            case 'add_object':
            {
                const record = this.objects.get(op.objectId);
                if (!record)
                {
                    this.objects.set(op.objectId, {
                        id: op.objectId,
                        geometry: op.geometry,
                        createdBy: op.id,
                        deleted: false,
                        addStamp: op.id,
                        removeStamp: null,
                        transform: new LWWRegister<number[]>(op.transform, op.id),
                        color: op.color,
                    });
                    return [{ type: 'added', objectId: op.objectId }];
                }

                // Re-adding an existing id is how undo revives a deleted object.
                const wasDeleted = record.deleted;
                const transformChanged = record.transform.set(op.transform, op.id);
                if (compareOpId(op.id, record.addStamp) > 0)
                    record.addStamp = op.id;
                record.deleted = this.isDeleted(record);

                if (wasDeleted && !record.deleted)
                    return [{ type: 'added', objectId: op.objectId }];

                const changes: Change[] = [];
                if (!record.deleted && transformChanged)
                    changes.push({ type: 'transform', objectId: op.objectId });
                return changes;
            }

            case 'remove_object':
            {
                const record = this.objects.get(op.objectId);
                if (!record)
                    return [];

                const wasDeleted = record.deleted;
                if (!record.removeStamp || compareOpId(op.id, record.removeStamp) > 0)
                    record.removeStamp = op.id;
                record.deleted = this.isDeleted(record);

                return !wasDeleted && record.deleted ? [{ type: 'removed', objectId: op.objectId }] : [];
            }

            case 'set_transform':
            {
                const record = this.objects.get(op.objectId);
                if (!record)
                    return [];

                const changed = record.transform.set(op.matrix, op.id);
                return changed && !record.deleted ? [{ type: 'transform', objectId: op.objectId }] : [];
            }

            default:
                return [];
        }
    }

    private isDeleted(record: ObjectRecord): boolean
    {
        return record.removeStamp !== null && compareOpId(record.removeStamp, record.addStamp) > 0;
    }

    public get(objectId: string): ObjectRecord | undefined
    {
        return this.objects.get(objectId);
    }

    public all(): IterableIterator<ObjectRecord>
    {
        return this.objects.values();
    }

    /** Used by the timeline: rebuild a state from a log prefix into a scratch DocumentState. */
    public static replay(ops: readonly Operation[]): DocumentState
    {
        const state = new DocumentState();
        for (const op of ops)
            state.apply(op);
        return state;
    }
}
