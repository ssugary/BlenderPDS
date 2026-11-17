/**
 * Wire validation for the editor's operation kinds.
 *
 * These predicates are the single definition of "a well-formed editor operation", used by the
 * transport, by the contract tests and by anything that has to trust a payload from the network.
 * They check shape only: whether an op makes sense against the current document is the job of the
 * kind's apply().
 */

export function isRecord(value: unknown): value is Record<string, unknown>
{
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOperationBase(value: unknown): value is Record<string, unknown>
{
    if (!isRecord(value))
        return false;

    const id = value.id;
    return isRecord(id)
        && typeof id.lamport === 'number'
        && typeof id.siteId === 'string'
        && typeof value.author === 'string'
        && Array.isArray(value.deps)
        && value.deps.every((dep) => isRecord(dep) && typeof dep.lamport === 'number' && typeof dep.siteId === 'string');
}

export function isString(value: unknown, maxLength = 100): value is string
{
    // 100 is the server's limit for a short string field; keeping the same number here is what
    // lets the shared contracts file mean the same thing on both sides.
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function isFiniteNumber(value: unknown): value is number
{
    return typeof value === 'number' && Number.isFinite(value);
}

/** A colour is an integer in the 24-bit range, the way three.js stores it. */
export function isColor(value: unknown): value is number
{
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffff;
}

/** A transform is a column-major 4x4 matrix, already flattened to sixteen numbers. */
export function isTransform(value: unknown): value is number[]
{
    return Array.isArray(value) && value.length === 16 && value.every(isFiniteNumber);
}
