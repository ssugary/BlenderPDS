import type { CSSProperties } from 'react';
import { Session } from '@collab3d/core';
/** What the Lobby layout hands to every lobby page through <Outlet context>. */
export interface LobbyOutletContext {
    /** Called with a connected session, or null when the user chooses to work offline. */
    onStart: (session: Session | null) => void;
}
export declare const useLobbyContext: () => LobbyOutletContext;
export declare const textStyle: CSSProperties;
export declare const headingStyle: CSSProperties;
export declare const codeBoxStyle: CSSProperties;
export declare const copy: (value: string) => void;
//# sourceMappingURL=LobbyShared.d.ts.map