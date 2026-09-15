import { Command } from "./Command"

export class AddObjectCommand extends Command
{
    constructor(createObjectTool, deleteTool, object3D, newObject3D){
        super()
        this.createObjectTool = createObjectTool
        this.deleteTool = deleteTool
        this.object = object3D
        this.newObject = newObject3D.clone()
    }
    execute() {
        this.createObjectTool.createObject(this.object)
    }
    undo() {
        this.deleteTool.deleteObject(this.object)
    }
    redo() {
        this.execute()
    } 
}