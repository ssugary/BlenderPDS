import { uuid } from '../core/utils/Id';
import { Change, createDocumentState } from './DocumentState';
import { DocumentSnapshot, LamportClock } from '@collab3d/core';
import { NewOperation, Operation } from './Operation';
import { OpLog } from '@collab3d/core';

/**
 * Glue for one replica: clock + log + state. Every edit, local or remote, goes through here.
 * CommandManager calls commit(), SyncEngine calls receive().
 */
export class ReplicaSession
{
    public readonly clock: LamportClock;
    public readonly log = new OpLog();
    public readonly state = createDocumentState();

    private changeListeners: Array<(changes: Change[]) => void> = [];
    private localListeners: Array<(op: Operation) => void> = [];

    public constructor(siteId: string = uuid())
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

    /**
     * Rehydration (P3.3): replaces the document with the server's snapshot and seeds the
     * version vector, so the hello that follows asks only for the operations after it.
     * Every live object is reported as one added change, which is what lets the projector
     * rebuild the scene without knowing about snapshots.
     */
    public restoreSnapshot(snapshot: DocumentSnapshot, versionVector?: Record<string, number>): void
    {
        this.state.restore(snapshot);
        if (versionVector)
            this.log.seedFromSnapshot(versionVector);

        const restored: Change[] = [];
        for (const record of this.state.all())
        {
            this.clock.observe(record.addStamp);
            if (record.removeStamp)
                this.clock.observe(record.removeStamp);
            for (const field of record.fields.values())
                this.clock.observe(field.stamp);

            if (!record.deleted)
                restored.push({ type: 'added', objectId: record.id });
        }
        this.notifyChanges(restored);
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

    /** Undoes onLocalOp: a disposed engine must stop sending a copy of every operation. */
    public offLocalOp(callback: (op: Operation) => void): void
    {
        this.localListeners = this.localListeners.filter((listener) => listener !== callback);
    }
}
