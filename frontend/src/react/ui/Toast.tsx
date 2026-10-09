import { useCallback, useEffect, useRef, useState } from 'react';
import { useBusEvent } from '../useBusEvent';

const DURATION_MS = 2500;

const toastStyle = {
    position: 'absolute' as const,
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    background: 'rgba(30, 30, 30, 0.9)',
    color: '#fff',
    border: '1px solid #666',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: 13
};

/** Shows short messages other modules request with GLOBAL_BUS.emit('ui:toast', text). */
export function Toast()
{
    const [text, setText] = useState<string | null>(null);
    const timerRef = useRef<number | undefined>(undefined);

    const show = useCallback((message: string) =>
    {
        setText(message);

        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setText(null), DURATION_MS);
    }, []);

    useBusEvent('ui:toast', (message) => show(String(message)));

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    if (text === null)
        return null;

    return <div id="toast" style={toastStyle}>{text}</div>;
}
