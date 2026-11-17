import { BaseOperation } from './Operation';
import { DocumentDraft } from './Record';
/**
 * One kind of operation, contributed by the application.
 *
 * The core only knows this contract: how to recognise the kind on the wire (`validate`), and
 * how it changes the document (`apply`). `apply` returns the changes that really happened, so a
 * projector can touch only what moved; returning `[]` means "nothing to report".
 *
 * Each definition is authored for the exact operation shape it understands; the registry erases
 * that type so a table can hold definitions of different kinds.
 */
export interface OperationKindDefinition<TOp extends BaseOperation = BaseOperation, TChange = unknown> {
    readonly kind: string;
    /** Rejects malformed operations. Both the transport and the contract tests use it. */
    validate(op: unknown): op is TOp;
    apply(draft: DocumentDraft, op: TOp): TChange[];
}
/** A registered definition, with the operation type erased behind `validate`. */
export interface RegisteredOperationKind<TChange = unknown> {
    readonly kind: string;
    validate(op: unknown): boolean;
    apply(draft: DocumentDraft, op: BaseOperation): TChange[];
}
/**
 * The kind table. Registration is explicit and duplicates are a programming error, not a
 * runtime fallback: an application that registers the same kind twice has a bug.
 */
export declare class OperationKindRegistry<TChange = unknown> {
    private readonly definitions;
    constructor(definitions?: readonly OperationKindDefinition<any, TChange>[]);
    register<TOp extends BaseOperation>(definition: OperationKindDefinition<TOp, TChange>): this;
    get(kind: string): RegisteredOperationKind<TChange> | undefined;
    has(kind: string): boolean;
    kinds(): string[];
}
//# sourceMappingURL=OperationKind.d.ts.map