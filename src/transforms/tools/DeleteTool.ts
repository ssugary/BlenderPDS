import { Tool } from './Tool.js';
import { DeleteObjectCommand } from '../commands/DeleteObjectCommand.js';
import { SceneManager } from '../../core/SceneManager.js';
import { CommandManager } from '../CommandManager.js';
import { SelectionManager } from '../../core/selection/SelectionManager.js';
import { TransformControls } from 'three/examples/jsm/Addons.js';
import { CreateObjectTool } from './CreateObjectTool.js';
import { Object3D } from 'three';
export class DeleteTool extends Tool
{
    private sceneManager:SceneManager;
    private commandManager:CommandManager;
    private selectionManager:SelectionManager;
    private transformControls:TransformControls;
    private createObjectTool:CreateObjectTool | any;
    constructor(sceneManager:SceneManager, commandManager:CommandManager, selectionManager:SelectionManager, transformControls:TransformControls)
    {
        super();
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        this.selectionManager = selectionManager;
        this.transformControls = transformControls;
        this.createObjectTool = null;
    }

    setCreateObjectTool(createObjectTool:CreateObjectTool)
    {
        this.createObjectTool = createObjectTool;
    }

    createCommand(selectedObject:Object3D){
        if (!selectedObject || !this.createObjectTool)
            return;

        this.commandManager.execute(new DeleteObjectCommand(this.createObjectTool, this, selectedObject));
    }

    deleteObject(object:Object3D)
    {
        if (!object)
            return;

        if (this.transformControls?.object === object)
            this.transformControls.detach();

        if (this.selectionManager?.getSelected() === object)
            this.selectionManager.deselectAll();

        this.sceneManager.removeObject(object.uuid, false);
    }
}
