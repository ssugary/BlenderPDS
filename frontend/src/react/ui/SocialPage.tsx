import { useCallback, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { joinSession, listFriendsSessions } from '../../api/Backend';
import { WebSocketTransport } from '../../network/WebSocketTransport';
import { AuthPanel } from './AuthPanel';
import { Friend } from './UseSocial';
import { FriendsPanel } from './FriendsPanel';
import { useSocialContext } from './SocialContext';
import { headingStyle, textStyle, useLobbyContext } from './LobbyShared';

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
    const { onStart } = useLobbyContext();
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);

    /**
     * Join a friend's room. The friends list already knows who is hosting, but the
     * session id is fetched here again so a room that closed in between gives a clear
     * message instead of a socket that never opens.
     */
    const join = useCallback(async (friend: Friend) =>
    {
        if (!social.user || busy)
            return;

        setBusy(true);
        setStatus(`Asking to join ${friend.name}...`);

        try
        {
            const open = await listFriendsSessions(social.user.id);
            const target = open.find((session) => session.hostId === friend.id);
            if (!target)
            {
                setStatus(`${friend.name} is not hosting right now.`);
                return;
            }

            await joinSession(target.id, social.user.id);
            const transport = new WebSocketTransport(WebSocketTransport.urlFor(target.id, social.user.id));
            onStart({ role: 'guest', transport, sessionId: target.id, userId: social.user.id, hostId: target.id, code: target.code });
        }
        catch (problem)
        {
            setStatus(problem instanceof Error ? problem.message : 'Could not join that session.');
        }
        finally
        {
            setBusy(false);
        }
    }, [social.user, busy, onStart]);

    // Route guard: friends only make sense for a signed-in user.
    if (!social.user)
        return <Navigate to="/login" replace state={{ from: '/friends' }} />;

    return (
        <>
            <h2 style={headingStyle}>Friends</h2>
            <FriendsPanel social={social} onJoin={join} />
            {status !== '' && <p style={textStyle}>{status}</p>}
            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}
