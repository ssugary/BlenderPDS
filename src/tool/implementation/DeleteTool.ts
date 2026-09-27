import { TransformControls } from "three/examples/jsm/Addons.js";
import { CommandManager } from "../../manager/CommandManager";
import { SceneManager } from "../../manager/SceneManager";
import { SelectionManager } from "../../manager/SelectionManager";
import { Tool } from "../Tool";
import { CreateObjectTool } from "./CreateObjectTool";
import { Object3D } from "three";
import { DeleteObjectCommand } from "../../command/implementation/DeleteObjectCommand.js";


export class DeleteTool extends Tool
{
    private sceneManager:SceneManager;
    private commandManager:CommandManager;
    private selectionManager:SelectionManager;
    private transformControls:TransformControls;
    private createObjectTool:CreateObjectTool | null;
    constructor(sceneManager:SceneManager, commandManager:CommandManager, selectionManager:SelectionManager, transformControls:TransformControls)
    {
        super();
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        this.selectionManager = selectionManager;
        this.transformControls = transformControls;
        this.createObjectTool = null;
    }

    public setCreateObjectTool(createObjectTool:CreateObjectTool):void
    {
        this.createObjectTool = createObjectTool;
    }

    public createCommand(selectedObject:Object3D):void
    {
        if (!selectedObject || !this.createObjectTool)
            return;

        this.commandManager.execute(new DeleteObjectCommand(this.createObjectTool, this, selectedObject));
    }

    public deleteObject(object:Object3D):void
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
