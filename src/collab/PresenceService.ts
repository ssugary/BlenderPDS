import { Transport } from '../network/Transport';

export interface PeerPresence
{
    siteId: string;
    /** Object this peer has selected, which doubles as its advisory lock. */
    selectedObjectId: string | null;
}

/**
 * Ephemeral state: who has what selected. NOT part of the OpLog, so it never shows in the timeline
 * and a disconnect clears it (onClose drops that peer's entry, which releases its lock).
 */
export class PresenceService
{
    public constructor(
        private readonly siteId: string,
        private readonly transport: Transport,
    )
    {
    }

    /**
     * Returns false if another peer holds the object (the click is refused, show a toast).
     * TODO: if lockedBy(id) is another site, return false. Else set own selection, broadcast
     *       { type: 'presence', siteId, selectedObjectId }, return true.
     * Race: if two claims for the same object cross on the wire, the lower siteId keeps it,
     * and the loser drops its selection when it receives the winning claim.
     */
    public claim(_objectId: string): boolean
    {
        throw new Error('not implemented');
    }

    /** TODO: clear own selection and broadcast. */
    public release(): void
    {
        throw new Error('not implemented');
    }

    /** TODO: look through remote peers' entries. Returns the siteId holding the lock, or null. */
    public lockedBy(_objectId: string): string | null
    {
        throw new Error('not implemented');
    }

    public peers(): PeerPresence[]
    {
        throw new Error('not implemented');
    }
}
