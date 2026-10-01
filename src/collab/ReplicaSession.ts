import { DocumentState, Change } from './DocumentState';
import { LamportClock } from './LamportClock';
import { NewOperation, Operation } from './Operation';
import { OpLog } from './OpLog';

/**
 * Glue for one replica: clock + log + state. Every edit, local or remote, goes through here.
 * CommandManager calls commit(), SyncEngine calls receive().
 */
export class ReplicaSession
{
    public readonly clock: LamportClock;
    public readonly log = new OpLog();
    public readonly state = new DocumentState();

    private changeListeners: Array<(changes: Change[]) => void> = [];
    private localListeners: Array<(op: Operation) => void> = [];

    public constructor(siteId: string = crypto.randomUUID())
    {
        this.clock = new LamportClock(siteId);
    }

    /**
     * Local edit. Never waits for the network.
     * TODO: build the full Operation (id = clock.tick(), author = siteId, deps = latest known),
     *       log.append, state.apply, notify onChange listeners, notify onLocalOp listeners (SyncEngine).
     */
    public commit(_op: NewOperation): Operation
    {
        throw new Error('not implemented');
    }

    /**
     * Remote edit.
     * TODO: if log.append() returns false it's a duplicate, so stop.
     *       Otherwise clock.observe(op.id), state.apply, notify onChange listeners.
     */
    public receive(_op: Operation): void
    {
        throw new Error('not implemented');
    }

    /** SceneProjector subscribes here. */
    public onChange(callback: (changes: Change[]) => void): void
    {
        this.changeListeners.push(callback);
    }

    /** SyncEngine subscribes here to broadcast local ops. Remote ops must NOT fire this (no echo). */
    public onLocalOp(callback: (op: Operation) => void): void
    {
        this.localListeners.push(callback);
    }
}
