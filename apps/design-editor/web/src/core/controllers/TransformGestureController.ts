import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { CameraManager } from '../../manager/CameraManager';
import { CommandManager } from '../../manager/CommandManager';
import { EditorModeManager } from '../../manager/EditorModeManager';
import { SelectionManager } from '../../manager/SelectionManager';
import { ToolManager } from '../../manager/ToolManager';
import { Tool } from '../../tool/Tool';
import { MeshEditTool } from '../../tool/implementation/MeshEditTool';
import { TransformTool } from '../../tool/implementation/TransformTool';
import { TransformCommand } from '../../command/implementation/TransformCommand';
import { ReplicaSession } from '../../collab/ReplicaSession';
import { SceneProjector } from '../../collab/SceneProjector';

interface TransformGestureDependencies
{
    transformControls:TransformControls;
    cameraManager:CameraManager;
    commandManager:CommandManager;
    selectionManager:SelectionManager;
    toolManager:ToolManager;
    editorModeManager:EditorModeManager;
    meshEditTool:MeshEditTool;
    projector:SceneProjector;
    replica:ReplicaSession;
}

/**
 * The transform gizmo gesture: capture the matrix when the drag starts, hold remote updates for
 * the object being dragged, and commit one TransformCommand when it ends. One gesture is one
 * operation (and one undo step), never one per frame.
 */
export class TransformGestureController
{
    private gestureStart:any;

    public constructor(private readonly deps:TransformGestureDependencies)
    {
        this.gestureStart = null;
    }

    public install():void
    {
        this.deps.transformControls.addEventListener('dragging-changed', this.onDraggingChanged);
        this.deps.transformControls.addEventListener('objectChange', this.onObjectChange);
    }

    public dispose():void
    {
        this.deps.transformControls.removeEventListener('dragging-changed', this.onDraggingChanged);
        this.deps.transformControls.removeEventListener('objectChange', this.onObjectChange);
    }

    /** Edit mode drags vertices through its own tool; object mode uses whichever transform tool is active. */
    private activeTool():Tool | null
    {
        return this.deps.editorModeManager.current === 'edit'
            ? this.deps.meshEditTool
            : this.deps.toolManager.activeTool;
    }

    private readonly onDraggingChanged = (event:any):void =>
    {
        this.deps.cameraManager.setGizmoDragging(event.value);

        const tool = this.activeTool();
        const object = this.deps.transformControls.object;

        if (!tool || !object)
            return;

        const objectId = this.deps.projector.objectIdFor(object);

        if (event.value)
        {
            this.gestureStart = tool.captureState(object);
            this.deps.projector.holdTransform(objectId);
            return;
        }

        if (tool instanceof TransformTool && objectId)
        {
            this.deps.commandManager.execute(new TransformCommand(
                this.deps.replica,
                objectId,
                this.gestureStart,
                tool.captureState(object)
            ));
        }

        this.deps.projector.holdTransform(null);
    };

    private readonly onObjectChange = ():void =>
    {
        this.deps.selectionManager.update();
    };
}
