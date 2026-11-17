import { BaseOperation } from '../crdt/Operation';
import { VersionVector } from '../crdt/OpLog';
/** What a message handler is allowed to do: answer on the wire and touch the replica. */
export interface SyncReplica {
    readonly log: {
        versionVector(): VersionVector;
        since(vv: VersionVector): readonly BaseOperation[];
    };
    onLocalOp(callback: (op: BaseOperation) => void): void;
    offLocalOp(callback: (op: BaseOperation) => void): void;
    receive(op: BaseOperation): void;
}
/** Wire limits, owned by the application so it can tune them without touching the core. */
export interface SyncPolicy {
    chunkSize: number;
    maxOpsPerMessage: number;
    /** Rejects a malformed operation before it reaches the document. Injected by the app. */
    validateOperation(op: unknown): op is BaseOperation;
}
export declare const DEFAULT_SYNC_POLICY: SyncPolicy;
/** Everything a message definition needs. */
export interface MessageContext {
    replica: SyncReplica;
    policy: SyncPolicy;
    send(message: unknown): void;
}
/**
 * One wire message. Chat, presence and the sync protocol are all just definitions, so the engine
 * dispatches through a table and never grows a `switch` over message types.
 */
export interface MessageDefinition {
    readonly type: string;
    validate(payload: any): boolean;
    handle(payload: any, context: MessageContext): void;
}
export declare class MessageRegistry {
    private readonly definitions;
    constructor(definitions?: readonly MessageDefinition[]);
    register(definition: MessageDefinition): this;
    get(type: string): MessageDefinition | undefined;
    types(): string[];
}
//# sourceMappingURL=MessageRegistry.d.ts.map