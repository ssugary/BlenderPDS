import { Transport } from './Transport';

/** Messages sent while the socket is closed (or still connecting) wait here. */
const MAX_PENDING_FRAMES = 500;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 500;
const MAX_RECONNECT_DELAY_MS = 5_000;

/**
 * Collaboration transport against the backend, the counterpart of WebRTCConnection.
 *
 * It implements the same Transport interface, so Engine, SyncEngine, PresenceService
 * and ChatPanel did not change: the only difference is that messages now go through a
 * server that sequences the operations instead of straight to the other peer.
 *
 * Two details worth knowing:
 *
 * - **Everything is queued until the socket is open.** Engine builds SyncEngine right
 *   after the lobby finishes, and its `sync_hello` is sent before the handshake ends.
 * - **Reconnect replays the last `sync_hello`.** The server answers a hello with the
 *   operations the client is missing, and the client's OpLog drops duplicates, so
 *   replaying a stale vector is safe and the session heals itself. Operations created
 *   while offline are queued and sent right after that hello, which keeps the server's
 *   order meaningful.
 */
export class WebSocketTransport implements Transport
{
    private socket: WebSocket | null;
    private messageListeners: Array<(data: any) => void>;
    private closeListeners: Array<() => void>;
    private pending: any[];
    private lastHello: string | null;
    private attempts: number;
    private closedByUser: boolean;
    private readonly url: string;

    public constructor(url: string)
    {
        this.url = url;
        this.socket = null;
        this.messageListeners = [];
        this.closeListeners = [];
        this.pending = [];
        this.lastHello = null;
        this.attempts = 0;
        this.closedByUser = false;

        this.open();
    }

    /** Session socket for the backend, on the same origin (the Vite proxy forwards /ws in dev). */
    public static urlFor(sessionId: number, userId: number): string
    {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/ws/sessions/${sessionId}?userId=${userId}`;
    }

    public send(data: any): void
    {
        const payload = this.serialize(data);
        if (payload === null)
            return;

        if (data?.type === 'sync_hello')
            this.lastHello = payload;

        if (this.socket?.readyState === WebSocket.OPEN)
        {
            this.socket.send(payload);
            return;
        }

        // Socket down: keep the newest frames (dropping the oldest loses edits, dropping
        // the newest loses the user's last action, so the oldest go first).
        if (this.pending.length >= MAX_PENDING_FRAMES)
            this.pending.shift();
        this.pending.push(data);
    }

    public onMessage(callback: (data: any) => void): void
    {
        this.messageListeners.push(callback);
    }

    public offMessage(callback: (data: any) => void): void
    {
        this.messageListeners = this.messageListeners.filter((listener) => listener !== callback);
    }

    public onClose(callback: () => void): void
    {
        this.closeListeners.push(callback);
    }

    public offClose(callback: () => void): void
    {
        this.closeListeners = this.closeListeners.filter((listener) => listener !== callback);
    }

    /** Leaving on purpose: no reconnect, otherwise the server would see us come back. */
    public close(): void
    {
        this.closedByUser = true;
        this.pending = [];
        this.socket?.close();
        this.socket = null;
    }

    private open(): void
    {
        const socket = new WebSocket(this.url);
        this.socket = socket;

        socket.onopen = () =>
        {
            this.attempts = 0;

            // The catch-up handshake comes first, then whatever happened while offline.
            if (this.lastHello !== null && this.pending.length > 0)
                socket.send(this.lastHello);

            const queued = this.pending;
            this.pending = [];
            for (const message of queued)
            {
                const payload = this.serialize(message);
                if (payload !== null && !(message?.type === 'sync_hello' && payload === this.lastHello))
                    socket.send(payload);
            }
        };

        socket.onmessage = (event: MessageEvent) =>
        {
            let data: any;
            try
            {
                data = JSON.parse(event.data);
            }
            catch
            {
                return; // anything unparseable is ignored, like the old data channel did
            }

            for (const listener of [...this.messageListeners])
                listener(data);
        };

        socket.onclose = () =>
        {
            if (this.closedByUser)
                return;

            if (this.attempts < MAX_RECONNECT_ATTEMPTS)
            {
                const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** this.attempts, MAX_RECONNECT_DELAY_MS);
                this.attempts += 1;
                window.setTimeout(() => { if (!this.closedByUser) this.open(); }, delay);
                return;
            }

            this.notifyClose();
        };

        socket.onerror = () => { /* onclose always follows, and it is the one that decides */ };
    }

    private serialize(data: any): string | null
    {
        try
        {
            return JSON.stringify(data);
        }
        catch
        {
            return null;
        }
    }

    private notifyClose(): void
    {
        for (const listener of [...this.closeListeners])
            listener();
    }
}
