import { Command } from "./Command";

export class DeletionCommand extends Command{

    constructor(createObjectTool, deleteTool, object3D, oldObject3D){
        super()
        this.createObjectTool = createObjectTool
        this.deleteTool = deleteTool
        this.object = object3D
        this.oldObject = oldObject3D.clone()
    }

    execute(){
        this.deleteTool.deleteObject(this.object)
    }
    undo(){
        this.createObjectTool.createObject(this.oldObject)
    }
    redo(){
        this.execute()
    }
}