import { Command } from "./Command.js";

export class DeleteObjectCommand extends Command
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
        this.deleteTool.deleteObject(this.object);
    }

    undo()
    {
        this.createObjectTool.createObject(this.object);
    }

    redo()
    {
        this.execute();
    }
}
