import { BaseOperation } from '@collab3d/core';

/**
 * Operations carry RESULTS, not recipes: "set transform to this matrix", never "move by +1".
 * That makes them idempotent, so receiving one twice is harmless.
 * Everything must be plain JSON (it goes over the data channel), so no three.js classes here:
 * matrices are number[16], positions are [x, y, z].
 */
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
export interface ChangeColor extends BaseOperation
{
    kind: 'change_color';
    objectId: string;
    color: number;
}

export interface SetTransform extends BaseOperation
{
    kind: 'set_transform';
    objectId: string;
    matrix: number[];
}

/**
 * Replaces an object's geometry buffer (last-writer-wins, like every other field).
 *
 * It is a result, not a recipe: the whole buffer travels, so applying it twice is
 * harmless. Undo is not an operation — commands emit a compensating set_transform /
 * add_object / set_mesh instead.
 */
export interface SetMesh extends BaseOperation
{
    kind: 'set_mesh';
    objectId: string;
    /** Serialized geometry, bounded by design.max-mesh-bytes on both sides. */
    geometry: string;
}

export type Operation = AddObject | RemoveObject | SetTransform | SetMesh | ChangeColor;

/** Distributes Omit over the union so callers can build an op without id/author/deps. */
export type NewOperation = Operation extends infer O ? (O extends Operation ? Omit<O, 'id' | 'author' | 'deps'> : never) : never;
