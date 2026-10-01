import { Transport } from '../network/Transport';

export interface PeerPresence
{
    siteId: string;
    /** Object this peer has selected, which doubles as its advisory lock. */
    selectedObjectId: string | null;
}

const MAX_ID_LENGTH = 100;

/**
 * Ephemeral state: who has what selected. NOT part of the OpLog, so it never shows in the timeline
 * and a disconnect clears it (onClose drops every remote entry, which releases their locks).
 * The lock is advisory: it keeps well-behaved clients from colliding, the CRDT still converges if two edits land.
 */
export class PresenceService
{
    private selected: string | null = null;
    private remote = new Map<string, string | null>();
    private changeListeners: Array<() => void> = [];
    private lockLostListeners: Array<(objectId: string) => void> = [];

    public constructor(
        private readonly siteId: string,
        private readonly transport: Transport,
    )
    {
        this.transport.onMessage((data: any) => this.handle(data));
        this.transport.onClose(() =>
        {
            this.remote.clear();
            this.notifyChange();
        });
    }

    /** Returns false if another peer holds the object (the click is refused, show a toast). */
    public claim(objectId: string): boolean
    {
        if (this.lockedBy(objectId) !== null)
            return false;

        if (this.selected !== objectId)
        {
            this.selected = objectId;
            this.broadcast();
        }
        return true;
    }

    public release(): void
    {
        if (this.selected === null)
            return;

        this.selected = null;
        this.broadcast();
    }

    /** The siteId holding the lock on this object, or null when it is free (or held by us). */
    public lockedBy(objectId: string): string | null
    {
        for (const [site, selected] of this.remote)
        {
            if (selected === objectId)
                return site;
        }
        return null;
    }

    public peers(): PeerPresence[]
    {
        return [...this.remote].map(([siteId, selectedObjectId]) => ({ siteId, selectedObjectId }));
    }

    /** Fires when a remote peer's selection changes or it disconnects. */
    public onChange(callback: () => void): void
    {
        this.changeListeners.push(callback);
    }

    /** Fires when we lose a simultaneous claim: the engine should drop its selection of that object. */
    public onLockLost(callback: (objectId: string) => void): void
    {
        this.lockLostListeners.push(callback);
    }

    private broadcast(): void
    {
        this.transport.send({ type: 'presence', siteId: this.siteId, selectedObjectId: this.selected });
    }

    private handle(data: any): void
    {
        if (!data || data.type !== 'presence')
            return;
        if (typeof data.siteId !== 'string' || data.siteId.length === 0 || data.siteId.length > MAX_ID_LENGTH)
            return;

        const selected = data.selectedObjectId;
        if (selected !== null && (typeof selected !== 'string' || selected.length === 0 || selected.length > MAX_ID_LENGTH))
            return;

        this.remote.set(data.siteId, selected);

        // Two claims crossed on the wire: the lower siteId keeps the object, the other side lets go.
        if (selected !== null && selected === this.selected && data.siteId < this.siteId)
        {
            this.selected = null;
            this.broadcast();
            this.lockLostListeners.forEach((callback) => callback(selected));
        }

        this.notifyChange();
    }

    private notifyChange(): void
    {
        this.changeListeners.forEach((callback) => callback());
    }
}
