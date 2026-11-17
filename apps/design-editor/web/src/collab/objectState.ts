import { DocumentRecord, LwwStrategy } from '@collab3d/core';

/** Column-major identity, used when a record somehow has no transform register. */
export const IDENTITY_TRANSFORM = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function geometryOf(record: DocumentRecord): string
{
    return (record.meta.get('geometry') as string | undefined) ?? 'cube';
}

export function transformOf(record: DocumentRecord): number[]
{
    return LwwStrategy.value<number[]>(record, 'transform') ?? IDENTITY_TRANSFORM;
}

export function colorOf(record: DocumentRecord): number
{
    return LwwStrategy.value<number>(record, 'color') ?? 0xffffff;
}
