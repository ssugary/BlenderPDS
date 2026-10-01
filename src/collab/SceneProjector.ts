import { ReplicaSession } from './ReplicaSession';
import { Change } from './DocumentState';
import { SceneManager } from '../manager/SceneManager';
import { SelectionManager } from '../manager/SelectionManager';

/**
 * The ONLY place that writes shared content into SceneManager.
 * Listens to ReplicaSession.onChange and turns Change[] into three.js updates.
 * Also owns the objectId <-> Object3D mapping (put objectId in mesh.userData.objectId too,
 * so a raycast hit can be turned back into an objectId).
 */
export class SceneProjector
{
    public constructor(
        private readonly session: ReplicaSession,
        private readonly sceneManager: SceneManager,
        private readonly selectionManager: SelectionManager,
    )
    {
        this.session.onChange((changes) => this.project(changes));
    }

    /**
     * TODO: for each change:
     *   added     -> build the mesh (reuse CreateObjectTool.buildPrimitive), set userData.objectId,
     *                apply transform + color from the record, sceneManager.addObject.
     *   removed   -> sceneManager.removeObject; if it was selected, selectionManager.deselectAll().
     *   transform -> mesh.matrix.fromArray(record.transform.value), then decompose into
     *                position/rotation/scale (matrixAutoUpdate is on by default).
     *   material  -> mesh.material.color.setHex(record.color.value).
     */
    private project(_changes: Change[]): void
    {
        throw new Error('not implemented');
    }

    /** Raycast hit -> objectId. Used by the click flow before claiming a lock. */
    public objectIdFor(_mesh: unknown): string | null
    {
        throw new Error('not implemented');
    }
}
