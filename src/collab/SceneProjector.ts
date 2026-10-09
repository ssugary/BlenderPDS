import * as THREE from 'three';
import { ReplicaSession } from './ReplicaSession';
import { Change, ObjectRecord } from './DocumentState';
import { SceneManager } from '../manager/SceneManager';
import { SelectionManager } from '../manager/SelectionManager';
import { CreateObjectTool } from '../tool/implementation/CreateObjectTool';

/**
 * The ONLY place that writes shared content into SceneManager.
 * Listens to ReplicaSession.onChange and turns Change[] into three.js updates.
 * Also owns the objectId <-> Object3D mapping (objectId is kept in mesh.userData.objectId too,
 * so a raycast hit can be turned back into an objectId).
 */
export class SceneProjector
{
    private meshes = new Map<string, THREE.Mesh>();
    private draggingId: string | null = null;

    /** Called just before a shared mesh leaves the scene, so the engine can detach gizmos from it. */
    public onMeshRemoved: ((mesh: THREE.Mesh) => void) | null = null;

    public constructor(
        private readonly session: ReplicaSession,
        private readonly sceneManager: SceneManager,
        private readonly selectionManager: SelectionManager,
        private readonly createObjectTool: CreateObjectTool,
    )
    {
        this.session.onChange((changes) => this.project(changes));

        // Anything already in the document (e.g. synced before the engine started) has no change event coming.
        for (const record of this.session.state.all())
        {
            if (!record.deleted)
                this.addMesh(record);
        }
    }

    private project(changes: Change[]): void
    {
        for (const change of changes)
        {
            const record = this.session.state.get(change.objectId);
            if (!record)
                continue;

            switch (change.type)
            {
                case 'added':
                    this.addMesh(record);
                    break;
                case 'removed':
                    this.removeMesh(record.id);
                    break;
                case 'transform':
                    // Don't move an object under the cursor of the user who is dragging it.
                    if (record.id !== this.draggingId)
                        this.applyTransform(this.meshes.get(record.id), record);
                    break;
            }
        }
    }

    private addMesh(record: ObjectRecord): void
    {
        if (this.meshes.has(record.id))
            return;

        const mesh = this.createObjectTool.buildPrimitive(record.geometry);
        if (!mesh)
            return;

        mesh.userData.objectId = record.id;
        this.applyTransform(mesh, record);
        this.applyColor(mesh, record);

        this.sceneManager.addObject(mesh);
        this.meshes.set(record.id, mesh);
    }

    private removeMesh(objectId: string): void
    {
        const mesh = this.meshes.get(objectId);
        if (!mesh)
            return;

        if (this.selectionManager.getSelected() === mesh)
            this.selectionManager.deselectAll();

        this.onMeshRemoved?.(mesh);

        this.sceneManager.removeObject(mesh.uuid);
        this.meshes.delete(objectId);
    }

    /** The record holds a 16-number matrix. Position, rotation and scale are what three.js renders from. */
    private applyTransform(mesh: THREE.Mesh | undefined, record: ObjectRecord): void
    {
        if (!mesh)
            return;

        mesh.matrix.fromArray(record.transform.value);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        mesh.updateMatrixWorld(true);
    }

    private applyColor(mesh: THREE.Mesh | undefined, record: ObjectRecord): void
    {
        if (!mesh)
            return;

        (mesh.material as THREE.MeshStandardMaterial).color.setHex(record.color);
    }

    /**
     * Call with the id when a local drag starts and with null when it ends (after committing the result).
     * While held, remote transforms for that object are stored but not drawn. On release the mesh is
     * redrawn from the state, so it shows whichever write won.
     */
    public holdTransform(objectId: string | null): void
    {
        const previous = this.draggingId;
        this.draggingId = objectId;

        if (objectId === null && previous !== null)
        {
            const record = this.session.state.get(previous);
            if (record && !record.deleted)
                this.applyTransform(this.meshes.get(previous), record);
        }
    }

    /** Raycast hit -> objectId. Walks up the parents in case the hit is a child of a shared mesh. */
    public objectIdFor(object: THREE.Object3D | null): string | null
    {
        let current: THREE.Object3D | null = object;
        while (current)
        {
            const id = current.userData.objectId;
            if (typeof id === 'string')
                return id;
            current = current.parent;
        }
        return null;
    }

    /** The mesh for an objectId, e.g. to select it or attach a gizmo after a click. */
    public meshFor(objectId: string): THREE.Mesh | null
    {
        return this.meshes.get(objectId) ?? null;
    }
}
