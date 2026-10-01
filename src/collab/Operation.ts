import { OpId } from './OpId';

/**
 * Operations carry RESULTS, not recipes: "set transform to this matrix", never "move by +1".
 * That makes them idempotent, so receiving one twice is harmless.
 * Everything must be plain JSON (it goes over the data channel), so no three.js classes here:
 * matrices are number[16], positions are [x, y, z].
 */
interface BaseOperation
{
    id: OpId;
    author: string;
    /** Ops this one was created after. Used by the timeline and for causal ordering if needed. */
    deps: OpId[];
}

export interface AddObject extends BaseOperation
{
    kind: 'add_object';
    objectId: string;
    /** Primitive name ('cube', 'sphere', ...) or a serialized geometry. Start with the primitive name. */
    geometry: string;
    transform: number[];
    color: number;
}

export interface RemoveObject extends BaseOperation
{
    kind: 'remove_object';
    objectId: string;
}

export interface SetTransform extends BaseOperation
{
    kind: 'set_transform';
    objectId: string;
    matrix: number[];
}

export interface SetMaterial extends BaseOperation
{
    kind: 'set_material';
    objectId: string;
    color: number;
}

/** Stage 2 (after the MVP): vertex drags and topology edits on stable vertex/face ids. */
export interface MeshEdit extends BaseOperation
{
    kind: 'mesh_edit';
    objectId: string;
    vertexId: string;
    position: [number, number, number];
}

/** Stage 3 (after the MVP): marks earlier ops by this author as undone. */
export interface UndoOp extends BaseOperation
{
    kind: 'undo';
    targets: OpId[];
}

export type Operation = AddObject | RemoveObject | SetTransform | SetMaterial | MeshEdit | UndoOp;

/** Distributes Omit over the union so callers can build an op without id/author/deps. */
export type NewOperation = Operation extends infer O ? (O extends Operation ? Omit<O, 'id' | 'author' | 'deps'> : never) : never;
