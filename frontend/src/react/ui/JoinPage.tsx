import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiSession, getSessionByCode, joinSession } from '../../api/Backend';
import { WebSocketTransport } from '../../network/WebSocketTransport';
import { useSocialContext } from './SocialContext';
import { codeBoxStyle, headingStyle, textStyle, useLobbyContext } from './LobbyShared';

/**
 * Joining by code. The code is only a shortcut: friendship with the host is what
 * actually lets someone in, and the backend refuses the join (403) when it is missing
 * — the check is repeated when the socket opens, so it cannot be skipped.
 */
export function JoinPage()
{
    const navigate = useNavigate();
    const { onStart } = useLobbyContext();
    const { user } = useSocialContext();

    const [code, setCode] = useState('');
    const [session, setSession] = useState<ApiSession | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const lookUp = useCallback(async () =>
    {
        setError('');
        setSession(null);
        setBusy(true);

        try
        {
            setSession(await getSessionByCode(code));
        }
        catch
        {
            setError('No open session with that code.');
        }
        finally
        {
            setBusy(false);
        }
    }, [code]);

    const join = useCallback(async () =>
    {
        if (!session || !user)
            return;

        setError('');
        setBusy(true);

        try
        {
            await joinSession(session.id, user.id);
            const transport = new WebSocketTransport(WebSocketTransport.urlFor(session.id, user.id));
            onStart({ role: 'guest', transport, sessionId: session.id, userId: user.id, hostId: session.hostId, code: session.code });
        }
        catch (problem)
        {
            setBusy(false);
            setError(problem instanceof Error ? problem.message : 'Could not join that session.');
        }
    }, [session, user, onStart]);

    if (!user)
        return <Navigate to="/login" replace state={{ from: '/join' }} />;

    return (
        <>
            <h2 style={headingStyle}>Joining</h2>

            {session === null ? (
                <>
                    <p style={textStyle}>1. Paste the session code the host gave you:</p>
                    <textarea rows={2} value={code} style={codeBoxStyle} onChange={(event) => setCode(event.target.value)} />
                    <button onClick={lookUp} disabled={busy || code.trim() === ''}>
                        {busy ? 'Looking it up...' : 'Find session'}
                    </button>
                </>
            ) : (
                <>
                    <p style={textStyle}>
                        {`${session.hostNickname} is hosting (${session.participantCount}/${session.maxParticipants} in the session).`}
                    </p>
                    <button
                        onClick={join}
                        disabled={busy}
                        style={{ background: '#e8863a', borderColor: '#e8863a', color: '#111', fontWeight: 'bold' }}
                    >
                        {busy ? 'Joining...' : 'Join session'}
                    </button>
                    <button onClick={() => setSession(null)}>Another code</button>
                </>
            )}

            {error !== '' && <p style={{ ...textStyle, color: '#ff7b7b' }}>{error}</p>}

            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}
