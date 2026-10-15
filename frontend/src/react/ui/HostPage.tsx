import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebRTCConnection } from '../../network/WebRTCConnection';
import { codeBoxStyle, copy, headingStyle, textStyle, useLobbyContext } from './LobbyShared';

export function HostPage()
{
    const navigate = useNavigate();
    const { onStart } = useLobbyContext();

    const [status, setStatus] = useState('Creating invite code...');
    const [error, setError] = useState('');
    const [offerCode, setOfferCode] = useState('');
    const [answerInput, setAnswerInput] = useState('');

    // The offer and the answer belong to the same peer connection, and both steps live on this page.
    const connectionRef = useRef<WebRTCConnection | null>(null);

    useEffect(() =>
    {
        // Set by the cleanup when the user leaves the page (Back, browser back, a link...), so an
        // attempt that finishes later neither starts a session nor touches the unmounted page.
        let cancelled = false;

        const connection = new WebRTCConnection();
        connectionRef.current = connection;

        (async () =>
        {
            try
            {
                const offer = await connection.createOffer();
                if (cancelled)
                    return;

                setOfferCode(offer);
                setStatus('1. Send this invite code to your partner:');

                await connection.waitUntilOpen();
                if (cancelled)
                    return;

                onStart({ role: 'host', transport: connection });
            }
            catch
            {
                if (cancelled)
                    return;

                setStatus('');
                setError('Could not create the invite code.');
            }
        })();

        return () =>
        {
            cancelled = true;
            connectionRef.current = null;
            // If WebRTCConnection has a close(), call it here to free the peer connection.
        };
    }, [onStart]);

    const connectToGuest = async () =>
    {
        const connection = connectionRef.current;
        if (!connection)
            return;

        setError('Connecting...');

        try
        {
            await connection.acceptAnswer(answerInput);
        }
        catch
        {
            setError('That answer code is not valid.');
        }
    };

    return (
        <>
            <h2 style={headingStyle}>Hosting</h2>

            {status !== '' && <p style={textStyle}>{status}</p>}
            {offerCode !== '' && (
                <>
                    <textarea readOnly rows={5} value={offerCode} style={codeBoxStyle} onFocus={(event) => event.target.select()} />
                    <button onClick={() => copy(offerCode)}>Copy</button>
                    <p style={textStyle}>2. Paste their answer code here:</p>
                    <textarea rows={5} value={answerInput} style={codeBoxStyle} onChange={(event) => setAnswerInput(event.target.value)} />
                    <button onClick={connectToGuest}>Connect</button>
                </>
            )}
            {error !== '' && <p style={textStyle}>{error}</p>}

            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}