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
export interface OperationKindDefinition<TOp extends BaseOperation = BaseOperation, TChange = unknown>
{
    readonly kind: string;
    /** Rejects malformed operations. Both the transport and the contract tests use it. */
    validate(op: unknown): op is TOp;
    apply(draft: DocumentDraft, op: TOp): TChange[];
}

/** A registered definition, with the operation type erased behind `validate`. */
export interface RegisteredOperationKind<TChange = unknown>
{
    readonly kind: string;
    validate(op: unknown): boolean;
    apply(draft: DocumentDraft, op: BaseOperation): TChange[];
}

/**
 * The kind table. Registration is explicit and duplicates are a programming error, not a
 * runtime fallback: an application that registers the same kind twice has a bug.
 */
export class OperationKindRegistry<TChange = unknown>
{
    private readonly definitions = new Map<string, RegisteredOperationKind<TChange>>();

    public constructor(definitions: readonly OperationKindDefinition<any, TChange>[] = [])
    {
        for (const definition of definitions)
            this.register(definition);
    }

    public register<TOp extends BaseOperation>(definition: OperationKindDefinition<TOp, TChange>): this
    {
        if (this.definitions.has(definition.kind))
            throw new Error(`Operation kind already registered: ${definition.kind}`);

        this.definitions.set(definition.kind, {
            kind: definition.kind,
            validate: (op): boolean => definition.validate(op),
            // `validate` already guaranteed the shape when the operation came from the wire; the
            // log only ever stores operations that went through it.
            apply: (draft, op) => definition.apply(draft, op as TOp)
        });

        return this;
    }

    public get(kind: string): RegisteredOperationKind<TChange> | undefined
    {
        return this.definitions.get(kind);
    }

    public has(kind: string): boolean
    {
        return this.definitions.has(kind);
    }

    public kinds(): string[]
    {
        return [...this.definitions.keys()];
    }
}
