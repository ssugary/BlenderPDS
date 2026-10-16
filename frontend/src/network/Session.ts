import { Transport } from './Transport';

export type SessionRole = 'host' | 'guest';

export interface Session
{
    role: SessionRole;
    transport: Transport;
    /**
     * Backend session this transport belongs to. Absent in the direct WebRTC mode,
     * which is why everything below is optional: the editor only needs the transport.
     */
    sessionId?: number;
    /** Who is on this end (the backend takes the actor from the request, as in the friends API). */
    userId?: number;
    hostId?: number;
    /** Short code the host may share so a friend can join without the friends list. */
    code?: string;
}
