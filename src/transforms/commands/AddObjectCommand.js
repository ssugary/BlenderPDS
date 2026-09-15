import { Command } from "./Command.js";

export class AddObjectCommand extends Command
{
    constructor(createObjectTool, deleteTool, object3D)
    {
        super();
        this.createObjectTool = createObjectTool;
        this.deleteTool = deleteTool;
        this.object = object3D;
    }

    execute() 
    {
        this.createObjectTool.createObject(this.object);
    }

    undo() 
    {
        this.deleteTool.deleteObject(this.object);
    }

    redo() 
    {
        this.execute();
    } 
}
