import { OperationKindDefinition } from '@collab3d/core';
import { SetTransform } from '../collab/Operation';
import { Change } from './types';
import { isOperationBase, isString, isTransform } from './validation';

/**
 * Moves an object: the register compares stamps, not matrices, so a newer write is reported even
 * when the matrix happens to be the same. A write on a tombstone is stored but not reported.
 */
export const setTransformKind: OperationKindDefinition<SetTransform, Change> = {
    kind: 'set_transform',

    validate(op: unknown): op is SetTransform
    {
        return isOperationBase(op)
            && op.kind === 'set_transform'
            && isString(op.objectId)
            && isTransform(op.matrix);
    },

    apply(draft, op)
    {
        const record = draft.get(op.objectId);
        if (!record)
            return [];

        const changed = draft.writeField(record, 'transform', op.matrix, op.id);
        return changed && draft.isPresent(record)
            ? [{ type: 'transform', objectId: op.objectId }]
            : [];
    }
};
