import { OperationKindDefinition } from '@collab3d/core';
import { SetMesh } from '../collab/Operation';
import { Change } from './types';
import { isGeometry, isOperationBase, isString } from './validation';

/**
 * Replaces the serialized geometry of an object. The register compares stamps, so the
 * newest buffer wins and a late older edit cannot roll it back.
 *
 * The size ceiling is enforced here (bytes) and again on the server, which is the side
 * that actually protects the room: a client can always lie.
 */
export const setMeshKind: OperationKindDefinition<SetMesh, Change> = {
    kind: 'set_mesh',

    validate(op: unknown): op is SetMesh
    {
        return isOperationBase(op)
            && op.kind === 'set_mesh'
            && isString(op.objectId)
            && isGeometry(op.geometry);
    },

    apply(draft, op)
    {
        const record = draft.get(op.objectId);
        if (!record)
            return [];

        const changed = draft.writeField(record, 'geometry', op.geometry, op.id);
        return changed && draft.isPresent(record)
            ? [{ type: 'mesh', objectId: op.objectId }]
            : [];
    }
};
