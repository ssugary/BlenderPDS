import { useNavigate } from 'react-router-dom';
import { useSocialContext } from './SocialContext';
import { textStyle, useLobbyContext } from './LobbyShared';

interface MenuBlockProps
{
    title: string;
    hint: string;
    index: number;
    onClick: () => void;
    /** The main action of the screen gets a permanent accent edge. */
    primary?: boolean;
    badge?: string;
}

/** One wide, tall row of the menu. The stagger comes from `index` (see .menu-block in Lobby.tsx). */
function MenuBlock({ title, hint, index, onClick, badge }: MenuBlockProps)
{
    return (
        <button
            className={`menu-block${''}`}
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={onClick}
        >
            <span className="menu-block-title">
                {title}
                {badge && <span className="menu-badge">{badge}</span>}
            </span>
            <span className="menu-block-hint">{hint}</span>
        </button>
    );
}

export function MenuPage()
{
    const navigate = useNavigate();
    const { onStart } = useLobbyContext();
    const { user, requests } = useSocialContext();

    return (
        <>
            <p style={{ ...textStyle, color: '#9a9aa6' }}>Collaborative 3D modeling.</p>

            <MenuBlock
                index={0}
                title="HOST"
                hint="Create a session and invite a partner"
                onClick={() => navigate('/host')}
            />
            <MenuBlock
                index={1}
                title="JOIN"
                hint="Enter an invite code"
                onClick={() => navigate('/join')}
            />
            <MenuBlock
                index={2}
                title="FRIENDS"
                hint={user ? 'See who is online and join them' : 'Sign in to play with friends'}
                badge={user && requests.length > 0 ? `${requests.length} new` : undefined}
                onClick={() => navigate('/friends')}
            />
            <MenuBlock
                index={3}
                title="OFFLINE"
                hint="Work alone, no connection"
                onClick={() => onStart(null)}
            />
        </>
    );
}