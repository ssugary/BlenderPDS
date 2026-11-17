import { Transport } from './Transport';
/**
 * Collaboration transport against the backend — the only Transport implementation.
 *
 * It implements the Transport interface, so SyncEngine, PresenceService and ChatPanel
 * depend on the abstraction rather than on the socket: messages go through a server that
 * sequences the operations instead of straight to another peer.
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
export declare class WebSocketTransport implements Transport {
    private socket;
    private messageListeners;
    private closeListeners;
    private pending;
    private lastHello;
    private attempts;
    private closedByUser;
    private readonly url;
    constructor(url: string);
    /** Session socket for the backend, on the same origin (the Vite proxy forwards /ws in dev). */
    static urlFor(sessionId: number, userId: number): string;
    send(data: any): void;
    onMessage(callback: (data: any) => void): void;
    offMessage(callback: (data: any) => void): void;
    onClose(callback: () => void): void;
    offClose(callback: () => void): void;
    /** Leaving on purpose: no reconnect, otherwise the server would see us come back. */
    close(): void;
    private open;
    private serialize;
    private notifyClose;
}
//# sourceMappingURL=WebSocketTransport.d.ts.map