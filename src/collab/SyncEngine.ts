import { ReplicaSession } from './ReplicaSession';
import { Transport } from '../network/Transport';
import { Operation } from './Operation';
import { VersionVector } from './OpLog';

/**
 * Wire messages. They share the Transport with chat, which already switches on `type`,
 * so ChatPanel keeps ignoring anything that isn't 'chat'.
 */
export type SyncMessage =
    | { type: 'sync_hello'; vv: VersionVector }
    | { type: 'sync_ops'; ops: Operation[] };

export class SyncEngine
{
    public constructor(
        private readonly session: ReplicaSession,
        private readonly transport: Transport,
    )
    {
    }

    /**
     * TODO:
     *   1. transport.onMessage -> route 'sync_hello' / 'sync_ops' (validate shape and size first!).
     *   2. session.onLocalOp -> transport.send({ type: 'sync_ops', ops: [op] }).
     *   3. sendHello() once the channel is open so both sides catch up.
     */
    public start(): void
    {
        throw new Error('not implemented');
    }

    /** TODO: transport.send({ type: 'sync_hello', vv: session.log.versionVector() }). */
    private sendHello(): void
    {
        throw new Error('not implemented');
    }

    /**
     * Peer told us what it has: send what it is missing.
     * TODO: ops = session.log.since(vv); send as one 'sync_ops' message (chunk it if it gets big).
     */
    private onHello(_vv: VersionVector): void
    {
        throw new Error('not implemented');
    }

    /**
     * TODO: for each op, session.receive(op). Duplicates are dropped inside receive(),
     * so no extra dedupe is needed here. Reject ops that fail validation.
     */
    private onOps(_ops: Operation[]): void
    {
        throw new Error('not implemented');
    }
}
