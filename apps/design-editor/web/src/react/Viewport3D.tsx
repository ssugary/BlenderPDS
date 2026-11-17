import { useEffect, useRef } from 'react';
import { Engine } from '../core/Engine';
import { GLOBAL_BUS } from '../core/EventBus';
import { ReplicaSession } from '../collab/ReplicaSession';
import { Session } from '../network/Session';

/** A press-and-release further apart than this is a camera drag, not a selection click. */
const CLICK_DRAG_TOLERANCE_PX = 5;

interface Viewport3DProps
{
    replica: ReplicaSession;
    session?: Session | null;
}

/**
 * Mounts the imperative Three.js engine inside React.
 *
 * The engine is built once, in an effect, and is never rebuilt just because React re-rendered:
 * its dependencies (the replica and the session) live for the whole app. Cleanup calls
 * Engine.dispose(), which detaches the bus listeners and the GPU resources -- without it the
 * double mount that StrictMode does in development would leave a duplicate set of handlers.
 */
export function Viewport3D({ replica, session = null }: Viewport3DProps)
{
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const container = containerRef.current;
        if (!container)
            return;

        const engine = new Engine(container, replica, session);
        const canvas = engine.renderEngine.renderer.domElement;

        // Selection is a click on the canvas, not a drag. Same rule the old Viewport class used.
        let pointerDownCoords = { x: 0, y: 0 };

        const onPointerDown = (event: PointerEvent) =>
        {
            if (event.button !== 0)
                return;

            pointerDownCoords = { x: event.clientX, y: event.clientY };
        };

        const onPointerUp = (event: PointerEvent) =>
        {
            if (event.button !== 0)
                return;

            const distance = Math.hypot(event.clientX - pointerDownCoords.x, event.clientY - pointerDownCoords.y);
            if (distance > CLICK_DRAG_TOLERANCE_PX)
                return;

            const rect = canvas.getBoundingClientRect();
            GLOBAL_BUS.emit('ui:canvas_clicked', {
                x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((event.clientY - rect.top) / rect.height) * 2 + 1
            });
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);

        engine.start();

        return () =>
        {
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            engine.dispose();
        };
    }, [replica, session]);

    return <div ref={containerRef} style={{ position: 'fixed', inset: 0 }} />;
}
