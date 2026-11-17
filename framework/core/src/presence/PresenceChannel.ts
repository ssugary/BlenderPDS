import { Transport } from '../transport/Transport';

export interface PresenceEntry<T>
{
    siteId: string;
    state: T;
    /** Local clock reading of the last message, used by the TTL sweep. */
    seenAt: number;
}

export interface PresenceChannelOptions<T>
{
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
export class PresenceChannel<T>
{
    private local: T | null = null;
    private readonly remote = new Map<string, PresenceEntry<T>>();
    private readonly changeListeners: Array<() => void> = [];
    private readonly conflictListeners: Array<(state: T) => void> = [];
    private readonly throttleMs: number;
    private readonly ttlMs: number;
    private readonly messageType: string;
    private readonly now: () => number;

    private timer: ReturnType<typeof setTimeout> | null = null;
    private pending = false;

    private readonly onMessage = (data: unknown): void => this.handle(data);

    private readonly onClose = (): void =>
    {
        this.remote.clear();
        this.notifyChange();
    };

    public constructor(private readonly options: PresenceChannelOptions<T>)
    {
        this.throttleMs = options.throttleMs ?? 0;
        this.ttlMs = options.ttlMs ?? 0;
        this.messageType = options.messageType ?? 'presence';
        this.now = options.now ?? (() => Date.now());

        options.transport.onMessage(this.onMessage);
        options.transport.onClose(this.onClose);
    }

    /** Local state, as last published (null means "nothing to say"). */
    public get state(): T | null
    {
        return this.local;
    }

    /** Publishes this end's state; the wire send is throttled, the local value is immediate. */
    public publish(state: T | null): void
    {
        this.local = state;
        this.schedule();
    }

    public peers(): PresenceEntry<T>[]
    {
        this.expire();
        return [...this.remote.values()];
    }

    public onChange(callback: () => void): void
    {
        this.changeListeners.push(callback);
    }

    /**
     * Two peers published the same state at nearly the same time. The lower site id keeps it and
     * this side clears its own state, so the host can react (drop a selection, show a toast).
     */
    public onConflict(callback: (state: T) => void): void
    {
        this.conflictListeners.push(callback);
    }

    /** Detaches every listener and timer: a disposed host must not answer for a dead socket. */
    public stop(): void
    {
        if (this.timer !== null)
            clearTimeout(this.timer);
        this.timer = null;

        this.options.transport.offMessage(this.onMessage);
        this.options.transport.offClose(this.onClose);
    }

    private schedule(): void
    {
        if (this.throttleMs <= 0)
        {
            this.flush();
            return;
        }

        if (this.timer !== null)
        {
            this.pending = true;
            return;
        }

        this.flush();
        this.timer = setTimeout(() =>
        {
            this.timer = null;
            if (this.pending)
            {
                this.pending = false;
                this.schedule();
            }
        }, this.throttleMs);
    }

    private flush(): void
    {
        this.options.transport.send({
            type: this.messageType,
            siteId: this.options.siteId,
            state: this.local === null ? null : this.options.encode(this.local)
        });
    }

    private handle(data: unknown): void
    {
        if (typeof data !== 'object' || data === null)
            return;

        const message = data as { type?: unknown; siteId?: unknown; state?: unknown };
        if (message.type !== this.messageType)
            return;
        if (typeof message.siteId !== 'string' || message.siteId.length === 0 || message.siteId.length > 100)
            return;
        if (message.siteId === this.options.siteId)
            return;

        const state = message.state === null ? null : this.options.decode(message.state);
        if (state === null)
        {
            this.remote.delete(message.siteId);
            this.notifyChange();
            return;
        }

        this.remote.set(message.siteId, { siteId: message.siteId, state, seenAt: this.now() });

        // Two claims crossed on the wire: the lower siteId keeps it, the other side lets go.
        if (this.local !== null
            && JSON.stringify(this.options.encode(state)) === JSON.stringify(this.options.encode(this.local))
            && message.siteId < this.options.siteId)
        {
            this.local = null;
            this.flush();
            this.conflictListeners.forEach((callback) => callback(state));
        }

        this.notifyChange();
    }

    private expire(): void
    {
        if (this.ttlMs <= 0)
            return;

        const cutoff = this.now() - this.ttlMs;
        for (const [siteId, entry] of this.remote)
        {
            if (entry.seenAt < cutoff)
                this.remote.delete(siteId);
        }
    }

    private notifyChange(): void
    {
        this.changeListeners.forEach((callback) => callback());
    }
}
