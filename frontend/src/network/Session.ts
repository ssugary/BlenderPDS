import { Transport } from './Transport';

export type SessionRole = 'host' | 'guest';

export interface Session
{
    role: SessionRole;
    transport: Transport;
}
