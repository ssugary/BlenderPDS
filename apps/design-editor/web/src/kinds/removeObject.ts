import { OperationKindDefinition } from '@collab3d/core';
import { RemoveObject } from '../collab/Operation';
import { Change } from './types';
import { isOperationBase, isString } from './validation';

/**
 * Tombstones an object. The record stays in the document so a late operation still finds it and
 * a newer add can revive it; only the transition alive -> deleted is reported.
 */
export const removeObjectKind: OperationKindDefinition<RemoveObject, Change> = {
    kind: 'remove_object',

    validate(op: unknown): op is RemoveObject
    {
        return isOperationBase(op)
            && op.kind === 'remove_object'
            && isString(op.objectId);
    },

    apply(draft, op)
    {
        const record = draft.get(op.objectId);
        if (!record)
            return [];

        const wasDeleted = !draft.isPresent(record);
        draft.removeFromSet(record, op.id);
        const nowDeleted = !draft.isPresent(record);

        return !wasDeleted && nowDeleted
            ? [{ type: 'removed', objectId: op.objectId }]
            : [];
    }
};
