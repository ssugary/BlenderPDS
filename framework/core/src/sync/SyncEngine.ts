import { BaseOperation } from '../crdt/Operation';
import { VersionVector } from '../crdt/OpLog';
import { Transport } from '../transport/Transport';
import {
    DEFAULT_SYNC_POLICY,
    MessageContext,
    MessageDefinition,
    MessageRegistry,
    SyncPolicy,
    SyncReplica
} from './MessageRegistry';
import { chunkOperations } from './chunking';
import { checksumOfState } from './snapshot';

function isVersionVector(value: unknown): value is VersionVector
{
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;

    return Object.values(value as Record<string, unknown>)
        .every((lamport) => typeof lamport === 'number' && Number.isFinite(lamport));
}

/**
 * Exchanges the operations two peers are missing: each side announces its version vector
 * (`sync_hello`) and answers the peer's with the ops it lacks (`sync_ops`). Duplicates are
 * dropped by the replica, so a reconnect may replay the last hello safely.
 *
 * Dispatch goes through a `MessageRegistry`: the sync protocol's two messages are definitions
 * registered here, and the host can add its own (chat, snapshots) without the engine knowing them.
 */
export class SyncEngine
{
    private readonly registry: MessageRegistry;
    private readonly policy: SyncPolicy;
    /** Highest server `seq` already folded into the replica (snapshots declare it). */
    private lastSeq = 0;
    private snapshotTimer: ReturnType<typeof setInterval> | null = null;

    public constructor(
        private readonly replica: SyncReplica,
        private readonly transport: Transport,
        options: { policy?: Partial<SyncPolicy>; messages?: readonly MessageDefinition[] } = {}
    )
    {
        this.policy = { ...DEFAULT_SYNC_POLICY, ...options.policy };
        this.registry = new MessageRegistry([
            this.helloDefinition(),
            this.opsDefinition(),
            this.snapshotDefinition(),
            ...(options.messages ?? [])
        ]);
    }

    public start(): void
    {
        this.transport.onMessage(this.onMessage);

        // Remote ops never fire onLocalOp, so nothing we receive is echoed back.
        this.replica.onLocalOp(this.onLocalOp);

        this.sendHello();
        this.startSnapshots();
    }

    /**
     * Detaches from the replica and the transport. React mounts the viewport inside an effect,
     * which in development runs twice; the disposed engine must stop sending a duplicate copy of
     * every local operation.
     */
    public stop(): void
    {
        this.transport.offMessage(this.onMessage);
        this.replica.offLocalOp(this.onLocalOp);
        if (this.snapshotTimer !== null)
        {
            clearInterval(this.snapshotTimer);
            this.snapshotTimer = null;
        }
    }

    public get messages(): readonly string[]
    {
        return this.registry.types();
    }

    private readonly onMessage = (data: unknown): void =>
    {
        if (typeof data !== 'object' || data === null)
            return;

        const message = data as { type?: unknown; seq?: unknown };
        if (typeof message.type !== 'string')
            return;

        if (typeof message.seq === 'number')
            this.lastSeq = Math.max(this.lastSeq, message.seq);

        const definition = this.registry.get(message.type);
        if (!definition || !definition.validate(data))
            return;

        definition.handle(data, this.context);
    };

    private readonly onLocalOp = (op: BaseOperation): void =>
        this.context.send({ type: 'sync_ops', ops: [op] });

    private get context(): MessageContext
    {
        return {
            replica: this.replica,
            policy: this.policy,
            send: (message) => this.transport.send(message)
        };
    }

    private sendHello(): void
    {
        this.context.send({ type: 'sync_hello', vv: this.replica.log.versionVector() });
    }

    private helloDefinition(): MessageDefinition
    {
        const engine = this;

        return {
            type: 'sync_hello',
            validate: (payload) => isVersionVector(payload?.vv),
            handle: (payload: { vv: VersionVector }) => engine.answerHello(payload.vv)
        };
    }

    private opsDefinition(): MessageDefinition
    {
        const engine = this;

        return {
            type: 'sync_ops',
            validate: (payload) => Array.isArray(payload?.ops),
            handle: (payload: { ops: unknown[] }) => engine.receiveOps(payload.ops)
        };
    }

    /**
     * The server's rehydration frame (P3.3): the stored materialisation arrives before
     * any operation after it. A replica that cannot restore ignores it and catches up
     * from the log instead.
     */
    private snapshotDefinition(): MessageDefinition
    {
        const engine = this;

        return {
            type: 'sync_snapshot',
            validate: (payload) => typeof payload?.snapshot === 'object' && payload.snapshot !== null,
            handle: (payload: { snapshot: Record<string, unknown> }) =>
            {
                const envelope = payload.snapshot;
                engine.replica.restoreSnapshot?.(
                    envelope.state,
                    envelope.versionVector as VersionVector | undefined
                );
            }
        };
    }

    /**
     * Peer told us what it has: send what it is missing, in log order, cut by count and by
     * bytes. A room with serialized meshes needs the size cap as much as the count cap.
     */
    private answerHello(vv: VersionVector): void
    {
        const missing = this.replica.log.since(vv);

        for (const batch of chunkOperations(missing, this.policy.chunkSize, this.policy.maxFrameBytes))
            this.context.send({ type: 'sync_ops', ops: batch });
    }

    /**
     * Periodic materialisation (P3.4): the host publishes what it already folded so a new
     * replica can start from `sync_snapshot` instead of the whole log. `baseSeq` is the last
     * server sequence seen, never one the state does not contain.
     */
    private startSnapshots(): void
    {
        if (this.policy.snapshotIntervalMs <= 0 || !this.replica.toSnapshot)
            return;

        this.snapshotTimer = setInterval(this.sendSnapshot, this.policy.snapshotIntervalMs);
        // A Vitest/Node process should not stay alive because of this timer.
        (this.snapshotTimer as unknown as { unref?: () => void }).unref?.();
    }

    private readonly sendSnapshot = (): void =>
    {
        const state = this.replica.toSnapshot?.();
        if (state === undefined)
            return;

        void checksumOfState(state).then((checksum) =>
        {
            this.context.send({
                type: 'scene_snapshot',
                snapshot: {
                    schemaVersion: 1,
                    baseSeq: this.lastSeq,
                    versionVector: this.replica.log.versionVector(),
                    state,
                    checksum
                }
            });
        }).catch(() => { /* no crypto.subtle: the next tick tries again */ });
    };

    /** Duplicates are dropped inside receive(). Anything that fails validation is ignored. */
    private receiveOps(ops: unknown[]): void
    {
        for (const op of ops.slice(0, this.policy.maxOpsPerMessage))
        {
            if (typeof (op as { seq?: unknown }).seq === 'number')
                this.lastSeq = Math.max(this.lastSeq, (op as { seq: number }).seq);

            if (this.policy.validateOperation(op))
                this.replica.receive(op);
        }
    }
}
