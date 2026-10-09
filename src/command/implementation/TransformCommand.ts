import { Matrix4 } from "three";
import { Command } from "../Command.js";
import { ReplicaSession } from "../../collab/ReplicaSession.js";

/** One set_transform per gesture, carrying the final matrix. Undo commits the old matrix as a new operation. */
export class TransformCommand extends Command 
{
    private oldMatrix:Matrix4;
    private newMatrix:Matrix4;
    
    constructor(
        private session:ReplicaSession,
        private objectId:string,
        oldMatrix:Matrix4,
        newMatrix:Matrix4,
    ) 
    {
        super();
        this.oldMatrix = oldMatrix.clone();
        this.newMatrix = newMatrix.clone();
    }

    public execute():void
    {        
        this.session.commit({ kind: 'set_transform', objectId: this.objectId, matrix: this.newMatrix.toArray() });
    }

    public undo():void
    {
        this.session.commit({ kind: 'set_transform', objectId: this.objectId, matrix: this.oldMatrix.toArray() });
    }

    public redo():void
    {
        this.execute();
    }
}
