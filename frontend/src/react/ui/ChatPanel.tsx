import { useEffect, useRef, useState } from 'react';
import { Session } from '../../network/Session';

const MAX_MESSAGE_LENGTH = 500;
const ONLINE_COLOR = '#3ddc84';
const OFFLINE_COLOR = '#ff5252';

interface ChatMessage
{
    /** null for system lines such as "Guest disconnected." */
    author: string | null;
    text: string;
}

interface ChatPanelProps
{
    session: Session;
}

const rootStyle = {
    position: 'absolute' as const,
    right: 10,
    bottom: 10,
    zIndex: 10,
    width: 280,
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(30, 30, 30, 0.85)',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    gap: 6,
    fontSize: 13
};

export function ChatPanel({ session }: ChatPanelProps)
{
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [online, setOnline] = useState(true);
    const [draft, setDraft] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    const partnerName = session.role === 'host' ? 'Guest' : 'Host';

    useEffect(() =>
    {
        const onMessage = (data: any) =>
        {
            if (data?.type === 'chat' && typeof data.text === 'string')
                setMessages((previous) => [
                    ...previous,
                    { author: partnerName, text: data.text.slice(0, MAX_MESSAGE_LENGTH) }
                ]);
        };

        const onClose = () =>
        {
            setOnline(false);
            setMessages((previous) => [...previous, { author: null, text: `${partnerName} disconnected.` }]);
        };

        session.transport.onMessage(onMessage);
        session.transport.onClose(onClose);

        // Transport keeps listeners in arrays, so without this the effect running twice would
        // duplicate every message instead of replacing the subscription.
        return () =>
        {
            session.transport.offMessage(onMessage);
            session.transport.offClose(onClose);
        };
    }, [session, partnerName]);

    useEffect(() =>
    {
        const list = listRef.current;
        if (list)
            list.scrollTop = list.scrollHeight;
    }, [messages]);

    const sendMessage = () =>
    {
        const text = draft.trim();
        if (!text)
            return;

        session.transport.send({ type: 'chat', text });
        setMessages((previous) => [...previous, { author: 'You', text }]);
        setDraft('');
    };

    return (
        <div id="chat" style={rootStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                <span
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        display: 'inline-block',
                        background: online ? ONLINE_COLOR : OFFLINE_COLOR
                    }}
                />
                <span>{online ? 'Players online: 2' : 'Players online: 1'}</span>
            </div>

            <div
                ref={listRef}
                style={{
                    height: 160,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    wordBreak: 'break-word'
                }}
            >
                {messages.map((message, index) => (
                    <div key={index} style={message.author === null ? { color: '#aaa', fontStyle: 'italic' } : undefined}>
                        {message.author === null
                            ? message.text
                            : <><strong>{`${message.author}: `}</strong>{message.text}</>}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
                <input
                    type="text"
                    placeholder="Message..."
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={draft}
                    disabled={!online}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) =>
                    {
                        if (event.key === 'Enter')
                            sendMessage();
                    }}
                    style={{ flex: 1, minWidth: 0, background: '#1a1a1a', color: '#fff', border: '1px solid #666', padding: 4 }}
                />
                <button onClick={sendMessage} disabled={!online}>Send</button>
            </div>
        </div>
    );
}
