import { Transport } from '../transport/Transport';
import { MessageDefinition, SyncPolicy, SyncReplica } from './MessageRegistry';
/**
 * Exchanges the operations two peers are missing: each side announces its version vector
 * (`sync_hello`) and answers the peer's with the ops it lacks (`sync_ops`). Duplicates are
 * dropped by the replica, so a reconnect may replay the last hello safely.
 *
 * Dispatch goes through a `MessageRegistry`: the sync protocol's two messages are definitions
 * registered here, and the host can add its own (chat, snapshots) without the engine knowing them.
 */
export declare class SyncEngine {
    private readonly replica;
    private readonly transport;
    private readonly registry;
    private readonly policy;
    constructor(replica: SyncReplica, transport: Transport, options?: {
        policy?: Partial<SyncPolicy>;
        messages?: readonly MessageDefinition[];
    });
    start(): void;
    /**
     * Detaches from the replica and the transport. React mounts the viewport inside an effect,
     * which in development runs twice; the disposed engine must stop sending a duplicate copy of
     * every local operation.
     */
    stop(): void;
    get messages(): readonly string[];
    private readonly onMessage;
    private readonly onLocalOp;
    private get context();
    private sendHello;
    private helloDefinition;
    private opsDefinition;
    /** Peer told us what it has: send what it is missing, in log order, in chunks. */
    private answerHello;
    /** Duplicates are dropped inside receive(). Anything that fails validation is ignored. */
    private receiveOps;
}
//# sourceMappingURL=SyncEngine.d.ts.map