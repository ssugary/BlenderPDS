import { Object3D } from "three";

import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool";
import { Command } from "../Command";
import { DeleteTool } from "../../tool/implementation/DeleteTool";

/**
 * Adds an already-built object to the scene and removes it on undo. This is the local path (no
 * operation, no sync); shared primitives are created by CreatePrimitiveCommand instead.
 */
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
