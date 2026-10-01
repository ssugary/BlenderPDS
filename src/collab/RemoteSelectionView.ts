import * as THREE from 'three';
import { PresenceService } from './PresenceService';
import { SceneProjector } from './SceneProjector';

const REMOTE_COLOR = 0xff8800;

/** Draws an orange box around whatever the other player has selected, which also explains why a click is refused. */
export class RemoteSelectionView
{
    private boxes = new Map<string, THREE.BoxHelper>();

    public constructor(
        private readonly scene: THREE.Scene,
        private readonly presence: PresenceService,
        private readonly projector: SceneProjector,
    )
    {
        this.presence.onChange(() => this.rebuild());
    }

    private rebuild(): void
    {
        const peers = this.presence.peers();

        for (const [siteId, box] of this.boxes)
        {
            if (!peers.some((peer) => peer.siteId === siteId))
            {
                this.scene.remove(box);
                box.dispose();
                this.boxes.delete(siteId);
            }
        }

        for (const peer of peers)
        {
            const mesh = peer.selectedObjectId ? this.projector.meshFor(peer.selectedObjectId) : null;
            let box = this.boxes.get(peer.siteId);

            if (!mesh)
            {
                if (box)
                    box.visible = false;
                continue;
            }

            if (!box)
            {
                box = new THREE.BoxHelper(mesh, REMOTE_COLOR);
                this.scene.add(box);
                this.boxes.set(peer.siteId, box);
            }

            box.setFromObject(mesh);
            box.userData.mesh = mesh;
            box.visible = true;
        }
    }

    /** Call every frame so the box follows the object while the other player drags it. */
    public update(): void
    {
        for (const box of this.boxes.values())
        {
            if (box.visible && box.userData.mesh)
                box.setFromObject(box.userData.mesh);
        }
    }
}
