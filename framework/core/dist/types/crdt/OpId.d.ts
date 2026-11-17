/**
 * Unique, totally ordered id for an operation.
 * Order = lamport first, siteId as tiebreak, so every replica ranks two ops the same way.
 */
export interface OpId {
    lamport: number;
    siteId: string;
}
export declare function compareOpId(a: OpId, b: OpId): number;
/** String form, handy as a Map key (e.g. OpLog index, dedupe set). */
export declare function opIdKey(id: OpId): string;
//# sourceMappingURL=OpId.d.ts.map