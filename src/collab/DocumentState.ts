import { Operation } from './Operation';
import { LWWRegister } from './LWWRegister';
import { OpId } from './OpId';

/** What the shared model knows about one object. No three.js here, only plain data. */
export interface ObjectRecord
{
    id: string;
    geometry: string;//placeholder for basic shapes
    //cube, pill, sphere, torus, etc
    createdBy: OpId;
    /** Tombstone: keep the record so late ops for this id don't crash, and so undo can revive it. */
    deleted: boolean;
    transform: LWWRegister<number[]>;
    color: LWWRegister<number>;
}

/** What apply() reports back, so SceneProjector only touches what actually changed. */
export type Change =
    | { type: 'added'; objectId: string }
    | { type: 'removed'; objectId: string }
    | { type: 'transform'; objectId: string }
    | { type: 'material'; objectId: string };

/**
 * The CRDT. Given the same set of ops it ends in the same state, whatever the arrival order.
 * It is the source of truth, and the three.js scene is just a view of it.
 */
export class DocumentState
{
    private objects = new Map<string, ObjectRecord>();

    /**
     * TODO: switch on op.kind.
     *   add_object      -> create the record (ignore if the id already exists).
     *   remove_object   -> mark deleted = true (delete wins over a concurrent move).
     *   set_transform   -> record.transform.set(matrix, op.id)
     *   set_material    -> record.color.set(color, op.id)
     * Ops for an unknown objectId can arrive before their add_object. Decide: buffer them, or
     * rely on SyncEngine delivering in log order per site (simplest for the MVP).
     * Return only the changes that really happened (register.set returns false when it loses).
     */
    public apply(_op: Operation): Change[]
    {
        switch(_op.kind){
            case 'add_object':
                if(!this.objects.has(_op.objectId)){
                    this.objects.set(_op.objectId, {
                        id: _op.objectId,
                        geometry: _op.geometry,
                        createdBy: _op.id,
                        deleted: false,
                        transform: new LWWRegister<number[]>(_op.transform, _op.id),
                        color: new LWWRegister<number>(_op.color, _op.id)
                    });
                    return [{type: 'added', objectId: _op.objectId}];
                }
                return [];
            case 'remove_object':
                const record = this.objects.get(_op.objectId);
                if(record && !record.deleted){
                    record.deleted = true;
                    return [{type: 'removed', objectId: _op.objectId}];
                }
                return [];
            case 'set_transform':
                const transformRecord = this.objects.get(_op.objectId);
                if(transformRecord && !transformRecord.deleted){
                    if(transformRecord.transform.set(_op.matrix, _op.id)){
                        return [{type: 'transform', objectId: _op.objectId}];
                    }
                }
                return [];
            case 'set_material':
                const materialRecord = this.objects.get(_op.objectId);
                if(materialRecord && !materialRecord.deleted){
                    if(materialRecord.color.set(_op.color, _op.id)){
                        return [{type: 'material', objectId: _op.objectId}];
                    }
                }
                return [];
            default:
                return [];
        }
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
