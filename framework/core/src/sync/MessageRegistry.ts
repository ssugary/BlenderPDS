import { BaseOperation } from '../crdt/Operation';
import { VersionVector } from '../crdt/OpLog';

/** What a message handler is allowed to do: answer on the wire and touch the replica. */
export interface SyncReplica
{
    readonly log: {
        versionVector(): VersionVector;
        since(vv: VersionVector): readonly BaseOperation[];
    };
    onLocalOp(callback: (op: BaseOperation) => void): void;
    offLocalOp(callback: (op: BaseOperation) => void): void;
    receive(op: BaseOperation): void;
    /** Optional: a replica that can be rehydrated from a snapshot (P3.3). */
    restoreSnapshot?(snapshot: unknown, versionVector?: VersionVector): void;
}

/** Wire limits, owned by the application so it can tune them without touching the core. */
export interface SyncPolicy
{
    chunkSize: number;
    maxOpsPerMessage: number;
    /** Text-frame budget, well below the ~8 KB where the socket is closed with 1009. */
    maxFrameBytes: number;
    /** Rejects a malformed operation before it reaches the document. Injected by the app. */
    validateOperation(op: unknown): op is BaseOperation;
}

export const DEFAULT_SYNC_POLICY: SyncPolicy = {
    chunkSize: 200,
    maxOpsPerMessage: 1000,
    maxFrameBytes: 7000,
    validateOperation: (op): op is BaseOperation =>
        typeof op === 'object' && op !== null && typeof (op as BaseOperation).kind === 'string'
};

/** Everything a message definition needs. */
export interface MessageContext
{
    replica: SyncReplica;
    policy: SyncPolicy;
    send(message: unknown): void;
}

/**
 * One wire message. Chat, presence and the sync protocol are all just definitions, so the engine
 * dispatches through a table and never grows a `switch` over message types.
 */
export interface MessageDefinition
{
    readonly type: string;
    validate(payload: any): boolean;
    handle(payload: any, context: MessageContext): void;
}

export class MessageRegistry
{
    private readonly definitions = new Map<string, MessageDefinition>();

    public constructor(definitions: readonly MessageDefinition[] = [])
    {
        for (const definition of definitions)
            this.register(definition);
    }

    public register(definition: MessageDefinition): this
    {
        if (this.definitions.has(definition.type))
            throw new Error(`Message type already registered: ${definition.type}`);

        this.definitions.set(definition.type, definition);
        return this;
    }

    public get(type: string): MessageDefinition | undefined
    {
        return this.definitions.get(type);
    }

    public types(): string[]
    {
        return [...this.definitions.keys()];
    }
}
