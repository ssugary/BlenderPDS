import { OperationKindRegistry } from '@collab3d/core';
import { addObjectKind } from './addObject';
import { changeColorKind } from './changeColor';
import { removeObjectKind } from './removeObject';
import { setTransformKind } from './setTransform';
import { setMeshKind } from './setMesh';
import { Change } from './types';

export type { Change } from './types';

/**
 * The editor's contribution to the framework: its operation kinds, in one table.
 *
 * A fresh registry per document keeps the core's "duplicate kind is a bug" rule honest and lets
 * tests build independent documents.
 */
export function editorKinds(): OperationKindRegistry<Change>
{
    return new OperationKindRegistry<Change>([
        addObjectKind,
        removeObjectKind,
        setTransformKind,
        changeColorKind,
        setMeshKind
    ]);
}
