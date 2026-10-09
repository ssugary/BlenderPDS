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

    /** Local edit. Never waits for the network. */
    public commit(newOp: NewOperation): Operation
    {
        // deps stays empty for the MVP; fill it with the ids you had seen if you need causal delivery later.
        const op = { ...newOp, id: this.clock.tick(), author: this.clock.id, deps: [] } as Operation;

        this.log.append(op);
        this.notifyChanges(this.state.apply(op));

        for (const listener of this.localListeners)
            listener(op);

        return op;
    }

    /** Remote edit. Duplicates are dropped, and it never fires onLocalOp (no echo back to the sender). */
    public receive(op: Operation): void
    {
        if (!this.log.append(op))
            return;

        this.clock.observe(op.id);
        this.notifyChanges(this.state.apply(op));
    }

    private notifyChanges(changes: Change[]): void
    {
        if (changes.length === 0)
            return;

        for (const listener of this.changeListeners)
            listener(changes);
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
