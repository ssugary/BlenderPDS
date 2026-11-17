import { OpId } from './OpId';
/**
 * Everything an operation must have, whatever its kind. Kinds are registered by the
 * application (`OperationKindRegistry`), so the core never names one.
 */
export interface BaseOperation {
    id: OpId;
    author: string;
    /** Ops this one was created after. Used by the timeline and for causal ordering if needed. */
    deps: OpId[];
    kind: string;
}
/** A generic operation: a `BaseOperation` plus whatever fields its kind defines. */
export type Operation = BaseOperation & Record<string, unknown>;
/** An operation as a caller builds it: the transport fields are stamped by the replica. */
export type OperationDraft = {
    kind: string;
} & Record<string, unknown>;
//# sourceMappingURL=Operation.d.ts.map