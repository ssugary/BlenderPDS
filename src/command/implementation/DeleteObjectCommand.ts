import { Object3D } from "three";
import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool.js";
import { DeleteTool } from "../../tool/implementation/DeleteTool.js";
import { Command } from "../Command.js";

export class DeleteObjectCommand extends Command
{
    
    constructor(
        private createObjectTool:CreateObjectTool,
        private deleteTool:DeleteTool,
        private object:Object3D | null,
    )
    {
        super();
    }

    public execute():void
    {
        if(this.object)
            this.deleteTool.deleteObject(this.object);

    }

    public undo():void
    {
        if(this.object)
            this.createObjectTool.createObject(this.object);
    }

    public redo():void
    {
        this.execute();
    }
}
