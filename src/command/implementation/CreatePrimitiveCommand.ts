import { MeshStandardMaterial } from "three";

import { CreateObjectTool } from "../../tool/implementation/CreateObjectTool.js";
import { Command } from "../Command.js";
import { ReplicaSession } from "../../collab/ReplicaSession.js";
import { NewOperation } from "../../collab/Operation.js";

/** Creating and undoing are both operations. The scene is updated by SceneProjector, not here. */
export class CreatePrimitiveCommand extends Command
{
    private readonly objectId:string;
    private addOperation:NewOperation | null;

    constructor(
        private session:ReplicaSession,
        private createObjectTool:CreateObjectTool,
        private objectType:string,
    )
    {
        super();
        this.objectId = crypto.randomUUID();
        this.addOperation = null;
    }

    public execute():void
    {
        if(!this.addOperation)
            this.addOperation = this.buildAddOperation();

        // Redo reuses the same object id, which revives the deleted object.
        if(this.addOperation)
            this.session.commit(this.addOperation);
    }

    public undo():void
    {
        if(this.addOperation)
            this.session.commit({ kind: 'remove_object', objectId: this.objectId });
    }

    public redo():void
    {
        this.execute();
    }

    /** Builds a throwaway mesh only to read its starting matrix and color, so buildPrimitive stays the single source. */
    private buildAddOperation():NewOperation | null
    {
        const mesh = this.createObjectTool.buildPrimitive(this.objectType);
        if(!mesh)
            return null;

        mesh.updateMatrix();
        const material = mesh.material as MeshStandardMaterial;
        const operation:NewOperation = {
            kind: 'add_object',
            objectId: this.objectId,
            geometry: this.objectType,
            transform: mesh.matrix.toArray(),
            color: material.color.getHex(),
        };

        mesh.geometry.dispose();
        material.dispose();
        return operation;
    }
}
