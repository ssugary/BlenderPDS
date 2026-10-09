import { Operation } from './Operation';
import { VersionVector } from './OpLog';

const MAX_ID_LENGTH = 100;
const MAX_VERSION_ENTRIES = 100;

function isShortString(value: unknown): value is string
{
    return typeof value === 'string' && value.length > 0 && value.length <= MAX_ID_LENGTH;
}

function isMatrix(value: unknown): value is number[]
{
    return Array.isArray(value) && value.length === 16 && value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

function isColor(value: unknown): value is number
{
    return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 0xffffff;
}

/**
 * Anything that comes off the network is untrusted, so check shape and size before it reaches the log.
 * Only the op kinds DocumentState understands today are accepted.
 */
export function isOperation(value: unknown): value is Operation
{
    if (typeof value !== 'object' || value === null)
        return false;

    const op = value as Record<string, any>;
    if (typeof op.id !== 'object' || op.id === null)
        return false;
    if (!Number.isInteger(op.id.lamport) || op.id.lamport < 0 || !isShortString(op.id.siteId))
        return false;
    if (op.author !== op.id.siteId || !Array.isArray(op.deps) || op.deps.length > 0)
        return false;

    switch (op.kind)
    {
        case 'add_object':
            return isShortString(op.objectId) && isShortString(op.geometry) && isMatrix(op.transform) && isColor(op.color);
        case 'remove_object':
            return isShortString(op.objectId);
        case 'set_transform':
            return isShortString(op.objectId) && isMatrix(op.matrix);
        default:
            return false;
    }
}

export function isVersionVector(value: unknown): value is VersionVector
{
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;

    const entries = Object.entries(value);
    return entries.length <= MAX_VERSION_ENTRIES
        && entries.every(([site, lamport]) => isShortString(site) && Number.isInteger(lamport) && (lamport as number) >= 0);
}
