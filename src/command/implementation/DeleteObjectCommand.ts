import { Command } from "../Command.js";
import { ReplicaSession } from "../../collab/ReplicaSession.js";

/** Deleting tombstones the object, and undo re-adds the same id with its current transform and its color. */
export class DeleteObjectCommand extends Command
{
    constructor(
        private session:ReplicaSession,
        private objectId:string,
    )
    {
        super();
    }

    public execute():void
    {
        this.session.commit({ kind: 'remove_object', objectId: this.objectId });
    }

    public undo():void
    {
        const record = this.session.state.get(this.objectId);
        if(!record)
            return;

        this.session.commit({
            kind: 'add_object',
            objectId: this.objectId,
            geometry: record.geometry,
            transform: record.transform.value,
            color: record.color,
        });
    }

    public redo():void
    {
        this.execute();
    }
}
