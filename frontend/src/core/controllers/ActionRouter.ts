import * as THREE from 'three';
import { CameraManager } from '../../manager/CameraManager';
import { CommandManager } from '../../manager/CommandManager';
import { EditorModeManager } from '../../manager/EditorModeManager';
import { SceneManager } from '../../manager/SceneManager';
import { SelectionManager } from '../../manager/SelectionManager';
import { ToolManager } from '../../manager/ToolManager';
import { SelectionStrategy } from '../../entity/SelectionStrategy';
import { CreateObjectTool } from '../../tool/implementation/CreateObjectTool';
import { DeleteTool } from '../../tool/implementation/DeleteTool';
import { MeshEditTool } from '../../tool/implementation/MeshEditTool';
import { CreatePrimitiveCommand } from '../../command/implementation/CreatePrimitiveCommand';
import { DeleteObjectCommand } from '../../command/implementation/DeleteObjectCommand';
import { ColorEditCommand } from '../../command/implementation/ColorEditCommand';
import { ReplicaSession } from '../../collab/ReplicaSession';
import { SceneProjector } from '../../collab/SceneProjector';
import { ObjectParser } from '../ObjectParser';
import { FileExporter } from '../utils/FileExporter';
import { BusSubscriptions } from '../BusSubscriptions';
import { GLOBAL_BUS } from '../EventBus';
import { SelectionController } from './SelectionController';

interface ActionRouterDependencies
{
    replica:ReplicaSession;
    commandManager:CommandManager;
    sceneManager:SceneManager;
    selectionManager:SelectionManager;
    editorModeManager:EditorModeManager;
    toolManager:ToolManager;
    meshEditTool:MeshEditTool;
    createObjectTool:CreateObjectTool;
    deleteTool:DeleteTool;
    projector:SceneProjector;
    cameraManager:CameraManager;
    selection:SelectionController;
    editStrategies:Record<string, SelectionStrategy>;
}

/**
 * The single entry point for user intent, whether it comes from the keyboard, the toolbar or a
 * keyboard shortcut. Each intent has exactly one handler here, so no action is wired twice.
 * Handlers stay thin: they pick the command or the tool, and the command owns the change.
 */
export class ActionRouter
{
    private readonly bus = new BusSubscriptions();

    public constructor(private readonly deps:ActionRouterDependencies) {}

    public install():void
    {
        this.bus.on('action:add_object', ({ type }) => this.addObject(type));
        this.bus.on('action:delete_object', () => this.deleteSelected());
        this.bus.on('action:change_color', ({ color }) => this.changeColor(color));
        this.bus.on('action:preview_color', ({ color }) => this.previewColor(color));
        this.bus.on('action:export_model', () => this.exportModel());
        this.bus.on('tool:change', (toolName) => this.changeTool(toolName));
        this.bus.on('editor:toggle_mode', () => this.toggleMode());
        this.bus.on('camera:change_mode', () => this.deps.cameraManager.changeMode());
        this.bus.on('ui:canvas_clicked', (coords) => this.deps.selection.clickAt(coords));
        this.bus.on('input:action', (payload) => this.handleInputAction(payload));
    }

    public dispose():void
    {
        this.bus.dispose();
    }

    /**
     * Primitives are shared content, so they are born as a command. Imported models are still a
     * local-only object loaded straight into the scene (they have no object id, no sync, no undo).
     */
    private addObject(type:string):void
    {
        if (type === 'model')
        {
            ObjectParser.parseObject(type, this.deps.sceneManager);
            return;
        }

        this.deps.commandManager.execute(new CreatePrimitiveCommand(
            this.deps.replica,
            this.deps.createObjectTool,
            type
        ));
    }

    /** Deletes the selected object: shared objects through a command, imported models locally. */
    private deleteSelected():void
    {
        if (this.deps.editorModeManager.current !== 'object')
            return;

        const selected = this.deps.selectionManager.getSelected();
        if (!selected)
            return;

        const objectId = this.deps.projector.objectIdFor(selected);

        if (objectId)
            this.deps.commandManager.execute(new DeleteObjectCommand(this.deps.replica, objectId));
        else
            this.deps.deleteTool.deleteObject(selected);

        this.deps.selection.syncPresence();
    }

    /** Live colour preview while a slider is dragged: local-only, nothing enters the log. */
    private previewColor(color:any):void
    {
        const selected = this.deps.selectionManager.getSelected();
        if (!selected)
            return;

        const material = selected.material as THREE.MeshStandardMaterial;

        if (color instanceof THREE.Color)
        {
            material.color.copy(color);
            return;
        }

        const objectId = this.deps.projector.objectIdFor(selected);
        const record = objectId ? this.deps.replica.state.get(objectId) : undefined;

        if (record)
            material.color.setHex(record.color.value);
    }

    /** Releasing the picker commits once, so one colour choice is one operation and one undo step. */
    private changeColor(color:THREE.Color):void
    {
        if (this.deps.editorModeManager.current !== 'object')
            return;

        const objectId = this.deps.projector.objectIdFor(this.deps.selectionManager.getSelected());
        const record = objectId ? this.deps.replica.state.get(objectId) : undefined;
        const hex = color.getHex();

        if (!objectId || !record || record.color.value === hex)
            return;

        this.deps.commandManager.execute(new ColorEditCommand(
            this.deps.replica,
            objectId,
            hex,
            record.color.value
        ));
    }

    private changeTool(toolName:string):void
    {
        if (this.deps.editorModeManager.current === 'edit' && this.deps.editStrategies[toolName])
        {
            this.deps.meshEditTool.setStrategy(this.deps.editStrategies[toolName]);
            return;
        }

        const selection = this.deps.selectionManager.getSelected();
        if (selection)
            this.deps.toolManager.setTool(toolName, selection);
    }

    private toggleMode():void
    {
        const selection = this.deps.selectionManager.getSelected();
        if (selection)
            this.deps.editorModeManager.toggle(selection);
    }

    private exportModel():void
    {
        FileExporter.exportSceneAsOBJ(this.deps.sceneManager, 'scene.obj');
    }

    /** Keyboard actions: single-shot commands, plus the tool/mode shortcuts that mirror the toolbar. */
    private handleInputAction({ action, state }: { action:string, state:string }):void
    {
        if (state !== 'down')
            return;

        const { editorModeManager, meshEditTool, selectionManager, commandManager } = this.deps;

        if (action === 'action:extrude' && editorModeManager.current === 'edit')
            meshEditTool.extrudeSelected();

        if (action === 'action:split_edge' && editorModeManager.current === 'edit')
            meshEditTool.splitSelectedEdges();

        if (action.split(':')[0] === 'tool')
            GLOBAL_BUS.emit('tool:change', action.split(':')[1]);

        if (action === 'editor:toggle')
        {
            const selection = selectionManager.getSelected();
            if (selection)
                editorModeManager.toggle(selection);
        }

        if (action === 'action:delete_object' && editorModeManager.current === 'object')
            this.deleteSelected();

        if (action === 'system:undo')
        {
            commandManager.undo();
            selectionManager.update();
            this.deps.selection.syncPresence();
        }

        if (action === 'system:redo')
        {
            commandManager.redo();
            selectionManager.update();
            this.deps.selection.syncPresence();
        }
    }
}
