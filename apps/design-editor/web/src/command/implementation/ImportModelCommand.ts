import { ImportedObject } from '@collab3d/core';
import { Command } from '../Command';
import { ReplicaSession } from '../../collab/ReplicaSession';
import { isGeometry } from '../../kinds/validation';

/**
 * Collaborative .obj import: every parsed mesh becomes one `add_object` carrying the
 * serialized geometry, so the other replicas rebuild the same mesh without the file.
 *
 * Undo removes exactly the objects this import created; the geometry buffers are part
 * of the operation, bounded by the same byte ceiling as `set_mesh`.
 */
export class ImportModelCommand extends Command
{
    private readonly objectIds: string[] = [];

    public constructor(
        private readonly session: ReplicaSession,
        private readonly imported: readonly ImportedObject[],
    )
    {
        super();
    }

    public execute():void
    {
        for (const object of this.imported)
        {
            if (!isGeometry(object.geometry))
            {
                console.warn('Imported mesh above design.max-mesh-bytes, skipping:', object.name);
                continue;
            }

            const objectId = `obj-${crypto.randomUUID()}`;
            this.session.commit({
                kind: 'add_object',
                objectId,
                geometry: object.geometry,
                transform: object.matrix,
                color: 0x88ccff
            });
            this.objectIds.push(objectId);
        }
    }

    public undo():void
    {
        for (const objectId of this.objectIds)
            this.session.commit({ kind: 'remove_object', objectId });
    }

    public redo():void
    {
        this.execute();
    }
}
