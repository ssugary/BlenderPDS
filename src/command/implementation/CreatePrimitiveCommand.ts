import { Object3D } from "three";

import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool.js";
import { Command } from "../Command.js";
import { DeleteTool } from "../../tool/implementation/DeleteTool.js";

export class CreatePrimitiveCommand extends Command
{
    constructor(
        private createObjectTool:CreateObjectTool,
        private deleteTool:DeleteTool, 
        private objectType:string,
        private createdObject:Object3D | null = null
    )
    {
        super();
    }

    public execute():void
    {
        const obj = this.createObjectTool.buildPrimitive(this.objectType);
        if(obj)
        {
            this.createObjectTool.createObject(obj);
            this.createdObject = obj;
        }
    }

    public undo():void
    {
        if(this.createdObject)
            this.deleteTool.deleteObject(this.createdObject);
    }

    public redo():void
    {
        this.execute();
    } 
}
