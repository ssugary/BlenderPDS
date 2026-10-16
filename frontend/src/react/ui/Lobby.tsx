import { Outlet, useLocation } from 'react-router-dom';
import { Session } from '../../network/Session';
import { LobbyCube } from './LobbyCube';
import { LobbyTopBar } from './LobbyTopBar';
import type { LobbyOutletContext } from './LobbyShared';

interface LobbyProps
{
    /** Called with a connected session, or null when the user chooses to work offline. */
    onStart: (session: Session | null) => void;
    /** True while the lobby fades out on its way to the editor. */
    leaving?: boolean;
}

const rootStyle = {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '8vw',
    background: '#1f1f24', // keep in sync with BACKGROUND_COLOR in LobbyCube.tsx
    color: '#fff'
};

// Sits above the cube layer; the rest of the screen stays free so the cube can be dragged anywhere.
const panelStyle = {
    position: 'relative' as const,
    zIndex: 1,
    width: 'min(420px, 90vw)',
    boxSizing: 'border-box' as const,
    padding: 24,
    background: 'rgba(20, 20, 24, 0.8)',
    border: '1px solid #444',
    borderRadius: 10
};

// The menu has no card: its blocks are the panel.
const barePanelStyle = {
    ...panelStyle,
    width: 'min(460px, 90vw)',
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 0
};

const lobbyCss = `
#lobby button {
    padding: 10px 14px;
    background: #2e2e36;
    color: #fff;
    border: 1px solid #5a5a66;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}
#lobby button:hover { background: #3d3d48; border-color: #e8863a; }

@keyframes lobby-page-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
}

/* Every route change remounts .lobby-page (it is keyed by the path), which replays this. */
.lobby-page {
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: lobby-page-in 0.2s ease-out;
}
/* The menu animates block by block instead of as a whole. */
.lobby-page--menu { gap: 12px; animation: none; }

/* ---- top bar ---- */
.lobby-topbar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 56px;
    padding: 0 24px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    z-index: 2;
    /* The bar is see-through to the mouse so the cube can still be dragged beneath it. */
    pointer-events: none;
}
.lobby-topbar > * { pointer-events: auto; }
.lobby-user { display: flex; align-items: center; gap: 10px; font-size: 14px; }

#lobby .lobby-brand {
    margin: 0; padding: 0;
    background: none; border: none; border-radius: 0;
    font-size: 15px; font-weight: bold; letter-spacing: 0.35em;
}
#lobby .lobby-brand:hover { background: none; color: #e8863a; }

#lobby .lobby-link {
    margin: 0; padding: 4px 8px;
    background: none; border: none; border-radius: 0;
    color: #9a9aa6; font-size: 13px;
}
#lobby .lobby-link:hover { background: none; color: #fff; text-decoration: underline; }

/* ---- menu blocks ---- */
#lobby .menu-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    margin: 0;
    padding: 18px 22px;
    text-align: left;
    background: rgba(20, 20, 24, 0.72);
    border: none;
    border-left: 3px solid #444;
    border-radius: 0;
    animation: lobby-page-in 0.3s ease-out both;
    transition: transform 0.15s, background 0.15s, border-color 0.15s;
}
#lobby .menu-block:hover {
    background: rgba(40, 40, 48, 0.88);
    border-left-color: #e8863a;
    transform: translateX(8px);
}
#lobby .menu-block--primary { border-left-color: #e8863a; }

.menu-block-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0.15em;
}
.menu-block-hint { font-size: 13px; color: #9a9aa6; }
.menu-badge {
    padding: 2px 8px;
    background: #e8863a;
    color: #111;
    border-radius: 10px;
    font-size: 11px;
    letter-spacing: 0.05em;
}

/* ---- leaving for the editor: everything fades to the plain background colour ---- */
#lobby > * { transition: opacity 0.3s ease-in; }
#lobby.lobby--leaving { pointer-events: none; }
#lobby.lobby--leaving > * { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
    #lobby > * { transition: none; }
    .lobby-page, #lobby .menu-block { animation: none; }
    #lobby .menu-block:hover { transform: none; }
}
`;

/**
 * Layout route for every lobby screen: the cube stays mounted behind the panel while
 * <Outlet /> swaps the page (menu, login, friends, host, join) according to the URL.
 */
export function Lobby({ onStart, leaving = false }: LobbyProps)
{
    const location = useLocation();
    const context: LobbyOutletContext = { onStart };
    const isMenu = location.pathname === '/';

    return (
        <div id="lobby" className={leaving ? 'lobby--leaving' : undefined} style={rootStyle}>
            <style>{lobbyCss}</style>
            <LobbyCube />
            <LobbyTopBar />
            <div style={isMenu ? barePanelStyle : panelStyle}>
                <div key={location.pathname} className={`lobby-page${isMenu ? ' lobby-page--menu' : ''}`}>
                    <Outlet context={context} />
                </div>
            </div>
        </div>
    );
}