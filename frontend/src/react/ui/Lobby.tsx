import { useRef, useState } from 'react';
import { WebRTCConnection } from '../../network/WebRTCConnection';
import { Session } from '../../network/Session';

type LobbyStep = 'menu' | 'host' | 'join-input' | 'join-answer';

interface LobbyProps
{
    /** Called with a connected session, or null when the user chooses to work offline. */
    onStart: (session: Session | null) => void;
}

const rootStyle = {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#242424',
    color: '#fff'
};

const panelStyle = {
    width: 'min(520px, 90vw)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10
};

const codeBoxStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #666',
    fontFamily: 'monospace',
    fontSize: 11
};

const textStyle = { margin: 0 };

export function Lobby({ onStart }: LobbyProps)
{
    const [step, setStep] = useState<LobbyStep>('menu');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [offerCode, setOfferCode] = useState('');
    const [answerCode, setAnswerCode] = useState('');
    const [answerInput, setAnswerInput] = useState('');
    const [offerInput, setOfferInput] = useState('');

    // Kept across the host's two steps: the offer and the answer belong to the same peer connection.
    const connectionRef = useRef<WebRTCConnection | null>(null);

    const startHost = async () =>
    {
        setStep('host');
        setError('');
        setStatus('Creating invite code...');

        const connection = new WebRTCConnection();
        connectionRef.current = connection;

        try
        {
            setOfferCode(await connection.createOffer());
            setStatus('1. Send this invite code to your partner:');

            await connection.waitUntilOpen();
            onStart({ role: 'host', transport: connection });
        }
        catch
        {
            setStatus('');
            setError('Could not create the invite code.');
        }
    };

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

    const createAnswer = async () =>
    {
        setStep('join-input');
        setError('');
        setStatus('Creating answer code...');

        const connection = new WebRTCConnection();
        connectionRef.current = connection;

        try
        {
            setAnswerCode(await connection.acceptOffer(offerInput));
            setStep('join-answer');
            setStatus('Waiting for the host to connect...');

            await connection.waitUntilOpen();
            onStart({ role: 'guest', transport: connection });
        }
        catch
        {
            setStatus('');
            setError('That invite code is not valid.');
        }
    };

    const copy = (value: string) => { navigator.clipboard?.writeText(value); };

    const heading = step === 'menu' ? 'BlenderPDS' : (step === 'host' ? 'Hosting' : 'Joining');

    return (
        <div id="lobby" style={rootStyle}>
            <div style={panelStyle}>
                <h2 style={{ margin: 0 }}>{heading}</h2>

                {step === 'menu' && (
                    <>
                        <p style={textStyle}>Collaborative 3D modeling. Host a session or join one.</p>
                        <button onClick={startHost}>Host a session</button>
                        <button onClick={() => { setStep('join-input'); setError(''); }}>Join a session</button>
                        <button onClick={() => onStart(null)}>Work offline</button>
                    </>
                )}

                {step === 'host' && (
                    <>
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
                    </>
                )}

                {step === 'join-input' && (
                    <>
                        <p style={textStyle}>1. Paste the host&apos;s invite code:</p>
                        <textarea rows={5} value={offerInput} style={codeBoxStyle} onChange={(event) => setOfferInput(event.target.value)} />
                        <button onClick={createAnswer}>Create answer code</button>
                        {error !== '' && <p style={textStyle}>{error}</p>}
                    </>
                )}

                {step === 'join-answer' && (
                    <>
                        <p style={textStyle}>2. Send this answer code back to the host:</p>
                        <textarea readOnly rows={5} value={answerCode} style={codeBoxStyle} onFocus={(event) => event.target.select()} />
                        <button onClick={() => copy(answerCode)}>Copy</button>
                        <p style={textStyle}>{status}</p>
                    </>
                )}
            </div>
        </div>
    );
}
