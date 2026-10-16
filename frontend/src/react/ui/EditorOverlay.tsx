import { useState } from 'react';
import type { CSSProperties } from 'react';
import { FriendsPanel } from './FriendsPanel';
import { useSocialContext } from './SocialContext';
import { ACCENT, mutedStyle } from './SocialUI';

/** Colour the lobby ends on, so the hand-off to the editor has no flash. Keep in sync with Lobby.tsx. */
const CURTAIN_COLOR = '#1f1f24';

const css = `
@keyframes editor-curtain-out { from { opacity: 1; } to { opacity: 0; } }
.editor-curtain {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: ${CURTAIN_COLOR};
    pointer-events: none;
    /* The short delay lets the 3D engine mount behind the curtain before it is revealed. */
    animation: editor-curtain-out 0.7s ease-out 0.1s both;
}
@media (prefers-reduced-motion: reduce) {
    .editor-curtain { display: none; }
}
`;

const panelBase: CSSProperties = {
    position: 'fixed',
    zIndex: 150, // under the curtain, so the controls fade in with the scene
    background: 'rgba(30, 30, 30, 0.9)',
    color: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 13
};

const barStyle: CSSProperties = { ...panelBase, top: 10, right: 10, display: 'flex', gap: 6 };

const popoverStyle: CSSProperties = { ...panelBase, top: 58, right: 10, width: 240, padding: 12 };

const drawerStyle = (open: boolean): CSSProperties => ({
    ...panelBase,
    top: 58,
    right: 10,
    width: 320,
    boxSizing: 'border-box',
    maxHeight: 'calc(100vh - 330px)', // stops above the chat panel
    minHeight: 160,
    overflowY: 'auto',
    padding: 12,
    transform: open ? 'none' : 'translateX(calc(100% + 20px))',
    visibility: open ? 'visible' : 'hidden',
    transition: 'transform 0.25s ease, visibility 0.25s'
});

interface EditorOverlayProps
{
    /** Ends the session and goes back to the lobby menu. */
    onLeave: () => void;
}

/**
 * What sits on top of the editor besides the tools: the reveal from the lobby, a Menu button
 * (with a confirmation, since leaving closes the session) and a slide-in friends list.
 */
export function EditorOverlay({ onLeave }: EditorOverlayProps)
{
    const social = useSocialContext();
    const [curtain, setCurtain] = useState(true);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [notice, setNotice] = useState('');

    const onlineCount = social.user ? social.friends.filter((friend) => friend.status !== 'offline').length : 0;

    const toggleFriends = () =>
    {
        setConfirming(false);
        setFriendsOpen((open) => !open);
    };

    const askToLeave = () =>
    {
        setFriendsOpen(false);
        setConfirming((open) => !open);
    };

    return (
        <>
            <style>{css}</style>

            {curtain && <div className="editor-curtain" onAnimationEnd={() => setCurtain(false)} />}

            <div style={barStyle}>
                <button onClick={toggleFriends}>{onlineCount > 0 ? `Friends · ${onlineCount} online` : 'Friends'}</button>
                <button onClick={askToLeave}>Menu</button>
            </div>

            {confirming && (
                <div style={popoverStyle}>
                    <div style={{ marginBottom: 10 }}>Leave this session? Your work here will be closed.</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setConfirming(false)}>Stay</button>
                        <button onClick={onLeave} style={{ background: ACCENT, borderColor: ACCENT, color: '#111', fontWeight: 'bold' }}>
                            Leave
                        </button>
                    </div>
                </div>
            )}

            <div
                style={drawerStyle(friendsOpen)}
                // Typing here (a username, say) must not trigger editor shortcuts such as X or Backspace.
                onKeyDown={(event) => event.stopPropagation()}
                onKeyUp={(event) => event.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong>Friends</strong>
                    <button onClick={() => setFriendsOpen(false)}>✕</button>
                </div>

                {social.user ? (
                    <>
                        <FriendsPanel
                            social={social}
                            // No server yet: this only marks where the real "invite to this session" call goes.
                            onInvite={(friend) => setNotice(`Invite sent to ${friend.name}. (no server connected yet)`)}
                        />
                        {notice !== '' && <p style={{ ...mutedStyle, marginTop: 10 }}>{notice}</p>}
                    </>
                ) : (
                    <p style={mutedStyle}>Sign in from the menu to see your friends.</p>
                )}
            </div>
        </>
    );
}