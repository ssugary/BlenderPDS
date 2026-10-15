import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebRTCConnection } from '../../network/WebRTCConnection';
import { codeBoxStyle, copy, headingStyle, textStyle, useLobbyContext } from './LobbyShared';

export function JoinPage()
{
    const navigate = useNavigate();
    const { onStart } = useLobbyContext();

    const [offerInput, setOfferInput] = useState('');
    const [answerCode, setAnswerCode] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    // False once the user leaves the page, so a late result does not start a session behind their back.
    const aliveRef = useRef(true);

    useEffect(() =>
    {
        aliveRef.current = true;
        return () => { aliveRef.current = false; };
    }, []);

    const createAnswer = async () =>
    {
        setError('');
        setStatus('Creating answer code...');

        const connection = new WebRTCConnection();

        try
        {
            const answer = await connection.acceptOffer(offerInput);
            if (!aliveRef.current)
                return;

            setAnswerCode(answer);
            setStatus('Waiting for the host to connect...');

            await connection.waitUntilOpen();
            if (!aliveRef.current)
                return;

            onStart({ role: 'guest', transport: connection });
        }
        catch
        {
            if (!aliveRef.current)
                return;

            setStatus('');
            setError('That invite code is not valid.');
        }
    };

    return (
        <>
            <h2 style={headingStyle}>Joining</h2>

            {answerCode === '' ? (
                <>
                    <p style={textStyle}>1. Paste the host&apos;s invite code:</p>
                    <textarea rows={5} value={offerInput} style={codeBoxStyle} onChange={(event) => setOfferInput(event.target.value)} />
                    <button onClick={createAnswer}>Create answer code</button>
                    {error !== '' && <p style={textStyle}>{error}</p>}
                </>
            ) : (
                <>
                    <p style={textStyle}>2. Send this answer code back to the host:</p>
                    <textarea readOnly rows={5} value={answerCode} style={codeBoxStyle} onFocus={(event) => event.target.select()} />
                    <button onClick={() => copy(answerCode)}>Copy</button>
                    <p style={textStyle}>{status}</p>
                </>
            )}

            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}