import { DocumentState } from './DocumentState';
import { VersionVector } from './OpLog';

/**
 * Plain, JSON-only copy of the shared document.
 *
 * The backend does NOT understand the CRDT — it keeps the operation log as the source
 * of truth and stores this snapshot next to it, as a denormalisation, so a session can
 * be reopened (or inspected) without folding the whole log. If the two ever disagree,
 * the log wins.
 */
export interface SceneObjectSnapshot
{
    id: string;
    geometry: string;
    color: number;
    transform: number[];
    deleted: boolean;
}

export interface SceneSnapshot
{
    /** Highest Lamport stamp seen when the snapshot was taken. */
    revision: number;
    versionVector: VersionVector;
    objects: SceneObjectSnapshot[];
}

export function buildSceneSnapshot(state: DocumentState, versionVector: VersionVector): SceneSnapshot
{
    const objects: SceneObjectSnapshot[] = [];
    for (const record of state.all())
    {
        objects.push({
            id: record.id,
            geometry: record.geometry,
            color: record.color.value,
            transform: record.transform.value,
            deleted: record.deleted
        });
    }

    return {
        revision: Object.values(versionVector).reduce((highest, lamport) => Math.max(highest, lamport), 0),
        versionVector,
        objects
    };
}
