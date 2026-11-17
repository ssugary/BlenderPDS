import type { CSSProperties } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Session } from '../../network/Session';

/** What the Lobby layout hands to every lobby page through <Outlet context>. */
export interface LobbyOutletContext
{
    /** Called with a connected session, or null when the user chooses to work offline. */
    onStart: (session: Session | null) => void;
}

export const useLobbyContext = () => useOutletContext<LobbyOutletContext>();

export const textStyle: CSSProperties = { margin: 0 };

export const headingStyle: CSSProperties = { margin: 0 };

export const codeBoxStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #666',
    fontFamily: 'monospace',
    fontSize: 11
};

export const copy = (value: string) => { navigator.clipboard?.writeText(value); };