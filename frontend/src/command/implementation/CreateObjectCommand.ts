import { Object3D } from "three";

import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool";
import { Command } from "../Command";
import { DeleteTool } from "../../tool/implementation/DeleteTool";

export class AddObjectCommand extends Command
{
    constructor(
        private createObjectTool:CreateObjectTool,
        private deleteTool:DeleteTool, 
        private object:Object3D,
    )
    {
        super();
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
