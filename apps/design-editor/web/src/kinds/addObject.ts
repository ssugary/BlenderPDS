import { OperationKindDefinition } from '@collab3d/core';
import { AddObject } from '../collab/Operation';
import { Change } from './types';
import { isColor, isOperationBase, isString, isTransform } from './validation';

/**
 * Creates an object. Re-adding an existing id is how undo revives a deleted object: the newest
 * add stamp brings it back and the transform takes part in the LWW merge.
 *
 * Characteristic of today's model, kept on purpose: a reviving add writes the transform but not
 * the colour (the record was created once), so an object comes back with the colour it had.
 */
export const addObjectKind: OperationKindDefinition<AddObject, Change> = {
    kind: 'add_object',

    validate(op: unknown): op is AddObject
    {
        return isOperationBase(op)
            && op.kind === 'add_object'
            && isString(op.objectId)
            && isString(op.geometry)
            && isTransform(op.transform)
            && isColor(op.color);
    },

    apply(draft, op)
    {
        const existing = draft.get(op.objectId);

        if (!existing)
        {
            const record = draft.create(op.objectId, op.id, { geometry: op.geometry });
            draft.writeField(record, 'transform', op.transform, op.id);
            draft.writeField(record, 'color', op.color, op.id);
            return [{ type: 'added', objectId: op.objectId }];
        }

        const wasDeleted = !draft.isPresent(existing);
        const transformChanged = draft.writeField(existing, 'transform', op.transform, op.id);

        draft.addToSet(existing, op.id);

        const nowDeleted = !draft.isPresent(existing);
        if (wasDeleted && !nowDeleted)
            return [{ type: 'added', objectId: op.objectId }];

        return !nowDeleted && transformChanged
            ? [{ type: 'transform', objectId: op.objectId }]
            : [];
    }
};
