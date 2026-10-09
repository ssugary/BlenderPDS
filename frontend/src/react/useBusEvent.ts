import { useEffect, useRef } from 'react';
import { GLOBAL_BUS, ListenerFunction } from '../core/EventBus';

/**
 * Subscribes to GLOBAL_BUS for as long as the component stays mounted.
 *
 * The handler is kept in a ref, so a re-render never re-subscribes: the effect only reruns when
 * the event name itself changes. Its cleanup calls EventBus.off, which is what stops listeners
 * from piling up (and why the broken off() only became visible once React arrived).
 */
export function useBusEvent<T = any>(event: string, handler: (data: T) => void): void
{
    const handlerRef = useRef(handler);

    // Runs after every render so the subscription always calls the newest handler.
    useEffect(() =>
    {
        handlerRef.current = handler;
    });

    useEffect(() =>
    {
        const listener: ListenerFunction = (data) => handlerRef.current(data);

        GLOBAL_BUS.on(event, listener);

        return () => GLOBAL_BUS.off(event, listener);
    }, [event]);
}
