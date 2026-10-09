/**
 * Unique, totally ordered id for an operation.
 * Order = lamport first, siteId as tiebreak, so every replica ranks two ops the same way.
 */
export interface OpId
{
    lamport: number;
    siteId: string;
}

export function compareOpId(a: OpId, b: OpId): number
{
    if (a.lamport !== b.lamport)
        return a.lamport - b.lamport;
    return a.siteId < b.siteId ? -1 : a.siteId > b.siteId ? 1 : 0;
}

/** String form, handy as a Map key (e.g. OpLog index, dedupe set). */
export function opIdKey(id: OpId): string
{
    return `${id.lamport}@${id.siteId}`;
}
