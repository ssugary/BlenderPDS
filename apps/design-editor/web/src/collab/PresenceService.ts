import { PresenceChannel, Transport } from '@collab3d/core';

export interface PeerPresence
{
    siteId: string;
    /** Object this peer has selected, which doubles as its advisory lock. */
    selectedObjectId: string | null;
}

interface Claim
{
    selectedObjectId: string | null;
}

const MAX_ID_LENGTH = 100;

/**
 * Ephemeral state: who has what selected. NOT part of the OpLog, so it never shows in the timeline
 * and a disconnect clears it (the channel drops every remote entry on close, releasing their locks).
 *
 * The protocol lives in the core's `PresenceChannel`; this class only gives the generic claim a
 * meaning (an object id) and keeps the editor's `claim` / `lockedBy` / `onLockLost` vocabulary.
 * The lock is advisory: it keeps well-behaved clients from colliding, the CRDT still converges.
 */
export class PresenceService
{
    private readonly channel: PresenceChannel<Claim>;
    private readonly lockLostListeners: Array<(objectId: string) => void> = [];

    public constructor(siteId: string, transport: Transport)
    {
        this.channel = new PresenceChannel<Claim>({
            siteId,
            transport,
            // The editor's payload is one optional object id; nothing else crosses the wire.
            encode: (claim) => ({ selectedObjectId: claim.selectedObjectId }),
            decode: (payload) =>
            {
                const selected = (payload as { selectedObjectId?: unknown }).selectedObjectId;

                if (selected === null)
                    return { selectedObjectId: null };
                if (typeof selected !== 'string' || selected.length === 0 || selected.length > MAX_ID_LENGTH)
                    return null;

                return { selectedObjectId: selected };
            }
        });

        this.channel.onConflict((claim) =>
        {
            if (claim.selectedObjectId !== null)
                this.lockLostListeners.forEach((callback) => callback(claim.selectedObjectId!));
        });
    }

    /** Detaches from the transport; a disposed engine must stop answering for a dead socket. */
    public stop(): void
    {
        this.channel.stop();
    }

    /** Returns false if another peer holds the object (the click is refused, show a toast). */
    public claim(objectId: string): boolean
    {
        if (this.lockedBy(objectId) !== null)
            return false;

        if (this.selectedObjectId !== objectId)
            this.channel.publish({ selectedObjectId: objectId });

        return true;
    }

    public release(): void
    {
        if (this.selectedObjectId === null)
            return;

        this.channel.publish({ selectedObjectId: null });
    }

    /** The siteId holding the lock on this object, or null when it is free (or held by us). */
    public lockedBy(objectId: string): string | null
    {
        for (const peer of this.channel.peers())
        {
            if (peer.state.selectedObjectId === objectId)
                return peer.siteId;
        }
        return null;
    }

    public peers(): PeerPresence[]
    {
        return this.channel.peers().map((peer) => ({
            siteId: peer.siteId,
            selectedObjectId: peer.state.selectedObjectId
        }));
    }

    /** Fires when a remote peer's selection changes or it disconnects. */
    public onChange(callback: () => void): void
    {
        this.channel.onChange(callback);
    }

    /** Fires when we lose a simultaneous claim: the engine should drop its selection of that object. */
    public onLockLost(callback: (objectId: string) => void): void
    {
        this.lockLostListeners.push(callback);
    }

    private get selectedObjectId(): string | null
    {
        return this.channel.state?.selectedObjectId ?? null;
    }
}
