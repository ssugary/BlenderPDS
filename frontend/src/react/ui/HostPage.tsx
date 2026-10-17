import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError, ApiParticipant, ApiSession, createSession, getOpenSession, joinSession, listParticipants } from '../../api/Backend';
import { WebSocketTransport } from '../../network/WebSocketTransport';
import { useSocialContext } from './SocialContext';
import { codeBoxStyle, copy, headingStyle, textStyle, useLobbyContext } from './LobbyShared';
import { mutedStyle } from './SocialUI';

/** How often the page checks who has already walked in. */
const POLL_MS = 3_000;

/**
 * Resumes the host's open room or creates one.
 *
 * A host may only have one open room (the backend answers 409 to a second one) and a
 * room that was created and then abandoned is never ended by itself, so creating on
 * every visit would leave the host locked out of hosting after the first time.
 */
async function openOrResumeSession(hostId: number): Promise<ApiSession>
{
    const open = await getOpenSession(hostId);
    if (open)
        return open;

    try
    {
        return await createSession(hostId);
    }
    catch (problem)
    {
        // Lost a race with another tab (or with React's dev double mount): the room it
        // created is the one to use.
        if (problem instanceof ApiError && problem.status === 409)
        {
            const raced = await getOpenSession(hostId);
            if (raced)
                return raced;
        }
        throw problem;
    }
}

/**
 * Hosting screen. The session now exists on the backend before anyone connects, so:
 *
 * 1. opening this page creates the room (and shows the code friends can type);
 * 2. friends who are online see it in their friends list as "hosting";
 * 3. the host starts the editor when ready, which opens the collaboration socket.
 *
 * The backend refuses the socket to anyone who is not a friend of the host, so the
 * friends-only rule is enforced there, not by hiding the button here.
 */
export function HostPage()
{
    const navigate = useNavigate();
    const { onStart } = useLobbyContext();
    const { user } = useSocialContext();

    const [session, setSession] = useState<ApiSession | null>(null);
    const [participants, setParticipants] = useState<ApiParticipant[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const startingRef = useRef(false);
    /** Kept across React's dev double mount so the second run does not create again. */
    const loadingRef = useRef<{ userId: number; session: Promise<ApiSession> } | null>(null);

    useEffect(() =>
    {
        if (!user)
            return;

        let cancelled = false;

        if (loadingRef.current?.userId !== user.id)
            loadingRef.current = { userId: user.id, session: openOrResumeSession(user.id) };

        loadingRef.current.session
            .then((resumed) =>
            {
                if (!cancelled)
                    setSession(resumed);
            })
            .catch((problem) =>
            {
                if (cancelled)
                    return;

                // A failed attempt must not be cached, or a retry would replay the error.
                loadingRef.current = null;
                setError(problem instanceof Error ? problem.message : 'Could not open a session.');
            });

        return () => { cancelled = true; };
    }, [user]);

    useEffect(() =>
    {
        if (!session)
            return;

        let cancelled = false;
        const load = async () =>
        {
            try
            {
                const list = await listParticipants(session.id);
                if (!cancelled)
                    setParticipants(list);
            }
            catch
            {
                // The list is informational: a failed poll must not break the screen.
            }
        };

        void load();
        const timer = window.setInterval(load, POLL_MS);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [session]);

    const start = useCallback(async () =>
    {
        if (!session || !user || startingRef.current)
            return;

        startingRef.current = true;
        setBusy(true);
        setError('');

        try
        {
            // Confirms friendship/room state before opening the socket, so a failure
            // shows up here as a message instead of as a socket that retries forever.
            await joinSession(session.id, user.id);
            const transport = new WebSocketTransport(WebSocketTransport.urlFor(session.id, user.id));
            onStart({ role: 'host', transport, sessionId: session.id, userId: user.id, hostId: user.id, code: session.code });
        }
        catch (problem)
        {
            startingRef.current = false;
            setBusy(false);
            setError(problem instanceof Error ? problem.message : 'Could not start the session.');
        }
    }, [session, user, onStart]);

    if (!user)
        return <Navigate to="/login" replace state={{ from: '/host' }} />;

    const connected = participants.filter((participant) => participant.active);

    return (
        <>
            <h2 style={headingStyle}>Hosting</h2>

            {!session && error === '' && <p style={textStyle}>Opening a session...</p>}

            {session && (
                <>
                    <p style={textStyle}>Share this code with a friend, or just wait for them to see you in Friends:</p>
                    <textarea readOnly rows={1} value={session.code} style={codeBoxStyle} onFocus={(event) => event.target.select()} />
                    <button onClick={() => copy(session.code)}>Copy code</button>

                    <div style={{ ...mutedStyle, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {`In the session (${participants.length}/${session.maxParticipants})`}
                    </div>
                    <p style={textStyle}>
                        {connected.length <= 1
                            ? 'Nobody else is connected yet.'
                            : `${connected.filter((p) => p.userId !== user.id).map((p) => p.nickname).join(', ')} connected.`}
                    </p>

                    <button
                        onClick={start}
                        disabled={busy}
                        style={{ background: '#e8863a', borderColor: '#e8863a', color: '#111', fontWeight: 'bold' }}
                    >
                        {busy ? 'Starting...' : 'Start editing'}
                    </button>
                </>
            )}

            {error !== '' && <p style={{ ...textStyle, color: '#ff7b7b' }}>{error}</p>}

            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}
