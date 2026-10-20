import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { EditorModeManager } from '../../manager/EditorModeManager';
import { RaycasterManager } from '../../manager/RaycasterManager';
import { SelectionManager } from '../../manager/SelectionManager';
import { PresenceService } from '../../collab/PresenceService';
import { ReplicaSession } from '../../collab/ReplicaSession';
import { SceneProjector } from '../../collab/SceneProjector';
import { GLOBAL_BUS } from '../EventBus';

interface SelectionDependencies
{
    transformControls:TransformControls;
    raycasterManager:RaycasterManager;
    selectionManager:SelectionManager;
    editorModeManager:EditorModeManager;
    projector:SceneProjector;
    replica:ReplicaSession;
    /** Only exists in a networked session; offline the selection is purely local. */
    presence:PresenceService | null;
}

/**
 * Turns a click on the canvas into a selection, and keeps the selection lock published to the
 * other peer. It also announces the selection to the UI with the object id and colour, which is
 * the only shape listeners should receive.
 */
export class SelectionController
{
    public constructor(private readonly deps:SelectionDependencies) {}

    /** A click (not a drag, the viewport already filtered that out) selects whatever is under the pointer. */
    public clickAt(coords:{ x:number, y:number }):void
    {
        // A click that ends on the gizmo belongs to the gizmo, not to the scene.
        if (this.deps.transformControls.axis !== null)
            return;

        const intersect = this.deps.raycasterManager.pick(coords);

        if (this.deps.editorModeManager.current === 'object' && this.isLockedByOther(intersect))
            return;

        this.deps.editorModeManager.active.onCanvasClick(intersect);
        this.syncPresence();
        this.announce();
    }

    /** Makes our published selection (the advisory lock) match what is actually selected. */
    public syncPresence():void
    {
        const presence = this.deps.presence;
        if (!presence)
            return;

        const objectId = this.deps.projector.objectIdFor(this.deps.selectionManager.getSelected());

        if (!objectId)
            presence.release();
        else if (!presence.claim(objectId))
            this.dropSelection();
    }

    public dropSelection():void
    {
        this.deps.transformControls.detach();
        this.deps.selectionManager.deselectAll();
    }

    /** What the UI needs: the shared object id (null for local-only objects) and the current colour. */
    public announce():void
    {
        const selectedMesh = this.deps.selectionManager.getSelected();

        if (!selectedMesh)
        {
            GLOBAL_BUS.emit('selection:changed', { objectId: null, color: null });
            return;
        }

        const objectId = this.deps.projector.objectIdFor(selectedMesh);
        const record = objectId ? this.deps.replica.state.get(objectId) : undefined;
        const colorHex = record
            ? record.color.value
            : (selectedMesh.material as THREE.MeshStandardMaterial).color.getHex();

        GLOBAL_BUS.emit('selection:changed', { objectId, color: colorHex });
    }

    /** True when another player holds the clicked object (and tells the user why nothing happened). */
    private isLockedByOther(intersect:THREE.Intersection | null):boolean
    {
        const objectId = this.deps.projector.objectIdFor(intersect ? intersect.object : null);

        if (!objectId || !this.deps.presence || !this.deps.presence.lockedBy(objectId))
            return false;

        GLOBAL_BUS.emit('ui:toast', 'That object is being edited by the other player.');
        return true;
    }
}
