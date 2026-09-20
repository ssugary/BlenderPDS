import { Object3D } from "three";
import { CreateObjectTool } from "../tools/CreateObjectTool.js";
import { DeleteTool } from "../tools/DeleteTool.js";
import { Command } from "./Command.js";

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
