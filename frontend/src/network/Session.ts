import { Transport } from './Transport';

export type SessionRole = 'host' | 'guest';

export interface Session
{
    role: SessionRole;
    transport: Transport;
    /**
     * Backend session this transport belongs to. Optional because the editor also runs
     * offline, where there is no session at all.
     */
    sessionId?: number;
    /** Who is on this end (the backend takes the actor from the request, as in the friends API). */
    userId?: number;
}
