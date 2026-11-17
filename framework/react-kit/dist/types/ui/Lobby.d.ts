import { Session } from '@collab3d/core';
interface LobbyProps {
    /** Called with a connected session, or null when the user chooses to work offline. */
    onStart: (session: Session | null) => void;
    /** True while the lobby fades out on its way to the editor. */
    leaving?: boolean;
}
/**
 * Layout route for every lobby screen: the cube stays mounted behind the panel while
 * <Outlet /> swaps the page (menu, login, friends, host, join) according to the URL.
 */
export declare function Lobby({ onStart, leaving }: LobbyProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Lobby.d.ts.map