import { Command } from "../Command";
import { ReplicaSession } from "../../collab/ReplicaSession";

/**
 * Changes one object's colour as an operation. Undo commits the previous colour back, so both
 * peers converge instead of one silently restoring a local value.
 */
export class ColorEditCommand extends Command
{
    private postColor:number;
    private prevColor:number;

    constructor(
        private session:ReplicaSession,
        private objectId:string,
        postColor:number,
        prevColor:number,
    )
    {
        super();
        this.postColor = postColor;
        this.prevColor = prevColor;
    }

    public execute():void
    {
        this.session.commit({ kind: 'change_color', objectId: this.objectId, color :  this.postColor});
    }

    public undo():void
    {
        this.session.commit({ kind: 'change_color', objectId: this.objectId, color :  this.prevColor});
    }

    public redo():void
    {
        this.execute();
    }
}
