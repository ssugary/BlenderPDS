import { ReplicaSession } from './ReplicaSession';
import { Transport } from '../network/Transport';
import { Operation } from './Operation';
import { VersionVector } from './OpLog';
import { isOperation, isVersionVector } from './validate';

/**
 * Wire messages. They share the Transport with chat and presence, which each switch on `type`,
 * so every listener ignores messages that aren't theirs.
 */
export type SyncMessage =
    | { type: 'sync_hello'; vv: VersionVector }
    | { type: 'sync_ops'; ops: Operation[] };

const CHUNK_SIZE = 200;
const MAX_OPS_PER_MESSAGE = 1000;

/**
 * Exchanges the operations two peers are missing: each side announces its version vector
 * (`sync_hello`) and answers the peer's with the ops it lacks (`sync_ops`). Duplicates are
 * dropped by the replica, so a reconnect may replay the last hello safely.
 */
export class SyncEngine
{
    public constructor(
        private readonly session: ReplicaSession,
        private readonly transport: Transport,
    )
    {
    }

    public start(): void
    {
        this.transport.onMessage(this.onMessage);

        // Remote ops never fire onLocalOp, so nothing we receive is echoed back.
        this.session.onLocalOp(this.onLocalOp);

        this.sendHello();
    }

    /**
     * Detaches from the replica and the transport.
     *
     * React mounts the viewport inside an effect, which in development runs twice; the
     * engine created by the first mount is disposed, and without this its SyncEngine
     * would keep sending a duplicate copy of every local operation (and keep a
     * `sync_hello` on every reconnect).
     */
    public stop(): void
    {
        this.transport.offMessage(this.onMessage);
        this.session.offLocalOp(this.onLocalOp);
    }

    private readonly onMessage = (data: any): void =>
    {
        if (!data || typeof data !== 'object')
            return;

        if (data.type === 'sync_hello' && isVersionVector(data.vv))
            this.onHello(data.vv);
        else if (data.type === 'sync_ops' && Array.isArray(data.ops))
            this.onOps(data.ops);
    };

    private readonly onLocalOp = (op: Operation): void =>
        this.send({ type: 'sync_ops', ops: [op] });

    /** Tells the peer what we already have, so it can send what we are missing. */
    private sendHello(): void
    {
        this.send({ type: 'sync_hello', vv: this.session.log.versionVector() });
    }

    /** Peer told us what it has: send what it is missing, in log order, in chunks. */
    private onHello(vv: VersionVector): void
    {
        const missing = this.session.log.since(vv);
        for (let i = 0; i < missing.length; i += CHUNK_SIZE)
            this.send({ type: 'sync_ops', ops: missing.slice(i, i + CHUNK_SIZE) });
    }

    /** Duplicates are dropped inside receive(). Anything that fails validation is ignored. */
    private onOps(ops: unknown[]): void
    {
        for (const op of ops.slice(0, MAX_OPS_PER_MESSAGE))
        {
            if (isOperation(op))
                this.session.receive(op);
        }
    }

    private send(message: SyncMessage): void
    {
        this.transport.send(message);
    }
}
