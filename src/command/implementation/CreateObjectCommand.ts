import { Object3D } from "three";

import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool.js";
import { Command } from "../Command.js";
import { DeleteTool } from "../../tool/implementation/DeleteTool.js";

export class AddObjectCommand extends Command
{
    private createObjectTool:CreateObjectTool;
    private deleteTool:DeleteTool;
    private object:Object3D
    constructor(createObjectTool:CreateObjectTool, deleteTool:DeleteTool, object3D:Object3D)
    {
        super();
        this.createObjectTool = createObjectTool;
        this.deleteTool = deleteTool;
        this.object = object3D;
    }

    public execute():void
    {
        this.createObjectTool.createObject(this.object);
    }

    public undo():void
    {
        this.deleteTool.deleteObject(this.object);
    }

    public redo():void
    {
        this.execute();
    } 
}
