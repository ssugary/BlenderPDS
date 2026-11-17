import { Transport } from '../transport/Transport';
export interface PresenceEntry<T> {
    siteId: string;
    state: T;
    /** Local clock reading of the last message, used by the TTL sweep. */
    seenAt: number;
}
export interface PresenceChannelOptions<T> {
    /** Identity of this end. Entries from this id are never added to the peer map. */
    siteId: string;
    transport: Transport;
    /** Validates and narrows the per-peer payload; return null to drop a malformed message. */
    decode(payload: unknown): T | null;
    /** Turns the local state into the payload that goes on the wire. */
    encode(state: T): unknown;
    messageType?: string;
    /** Minimum gap between two sends; the latest state always wins. */
    throttleMs?: number;
    /** A peer that has not spoken for this long disappears (0 disables the sweep). */
    ttlMs?: number;
    now?(): number;
}
/**
 * Ephemeral per-peer state over an existing transport: who is here and what they are doing.
 *
 * Nothing here touches the operation log, so presence never shows in the timeline and a
 * disconnect simply clears the peer. The payload is application-defined (`T`), which is what lets
 * the core stay out of the domain: a selection, a cursor, a colour, all use the same channel.
 */
export declare class PresenceChannel<T> {
    private readonly options;
    private local;
    private readonly remote;
    private readonly changeListeners;
    private readonly conflictListeners;
    private readonly throttleMs;
    private readonly ttlMs;
    private readonly messageType;
    private readonly now;
    private timer;
    private pending;
    private readonly onMessage;
    private readonly onClose;
    constructor(options: PresenceChannelOptions<T>);
    /** Local state, as last published (null means "nothing to say"). */
    get state(): T | null;
    /** Publishes this end's state; the wire send is throttled, the local value is immediate. */
    publish(state: T | null): void;
    peers(): PresenceEntry<T>[];
    onChange(callback: () => void): void;
    /**
     * Two peers published the same state at nearly the same time. The lower site id keeps it and
     * this side clears its own state, so the host can react (drop a selection, show a toast).
     */
    onConflict(callback: (state: T) => void): void;
    /** Detaches every listener and timer: a disposed host must not answer for a dead socket. */
    stop(): void;
    private schedule;
    private flush;
    private handle;
    private expire;
    private notifyChange;
}
//# sourceMappingURL=PresenceChannel.d.ts.map