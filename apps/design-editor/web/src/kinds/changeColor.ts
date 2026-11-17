import { OperationKindDefinition } from '@collab3d/core';
import { ChangeColor } from '../collab/Operation';
import { Change } from './types';
import { isColor, isOperationBase, isString } from './validation';

/** Recolours an object through the same LWW register the transform uses. */
export const changeColorKind: OperationKindDefinition<ChangeColor, Change> = {
    kind: 'change_color',

    validate(op: unknown): op is ChangeColor
    {
        return isOperationBase(op)
            && op.kind === 'change_color'
            && isString(op.objectId)
            && isColor(op.color);
    },

    apply(draft, op)
    {
        const record = draft.get(op.objectId);
        if (!record)
            return [];

        const changed = draft.writeField(record, 'color', op.color, op.id);
        return changed && draft.isPresent(record)
            ? [{ type: 'color', objectId: op.objectId }]
            : [];
    }
};
