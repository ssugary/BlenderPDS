import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthPanel } from './AuthPanel';
import { FriendsPanel } from './FriendsPanel';
import { useSocialContext } from './SocialContext';
import { headingStyle, textStyle } from './LobbyShared';

export function AuthPage()
{
    const navigate = useNavigate();
    const location = useLocation();
    const social = useSocialContext();

    // A protected page that sent the user here says where to return to after signing in.
    const from = (location.state as { from?: string } | null)?.from ?? '/';

    return (
        <>
            <h2 style={headingStyle}>Account</h2>
            <AuthPanel social={social} onDone={() => navigate(from, { replace: true })} />
            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}

export function FriendsPage()
{
    const navigate = useNavigate();
    const social = useSocialContext();
    const [status, setStatus] = useState('');

    // Route guard: friends only make sense for a signed-in user.
    if (!social.user)
        return <Navigate to="/login" replace state={{ from: '/friends' }} />;

    return (
        <>
            <h2 style={headingStyle}>Friends</h2>
            <FriendsPanel
                social={social}
                // No server yet: this only shows where the real "join a friend" call will go.
                onJoin={(friend) => setStatus(`Asking to join ${friend.name}... (no server connected yet)`)}
            />
            {status !== '' && <p style={textStyle}>{status}</p>}
            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}