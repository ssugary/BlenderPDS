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
        this.transport.onMessage((data: any) =>
        {
            if (!data || typeof data !== 'object')
                return;

            if (data.type === 'sync_hello' && isVersionVector(data.vv))
                this.onHello(data.vv);
            else if (data.type === 'sync_ops' && Array.isArray(data.ops))
                this.onOps(data.ops);
        });

        // Remote ops never fire onLocalOp, so nothing we receive is echoed back.
        this.session.onLocalOp((op) => this.send({ type: 'sync_ops', ops: [op] }));

        this.sendHello();
    }

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
