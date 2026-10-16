import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { endSession, leaveSession } from './api/Backend';
import { ReplicaSession } from './collab/ReplicaSession';
import { buildSceneSnapshot } from './collab/SceneSnapshot';
import { GLOBAL_BUS } from './core/EventBus';
import { InputManager } from './manager/InputManager';
import { Session } from './network/Session';
import { Viewport3D } from './react/Viewport3D';
import { AppRoutes } from './react/ui/AppRoutes';
import { ChatPanel } from './react/ui/ChatPanel';
import { EditorOverlay } from './react/ui/EditorOverlay';
import { TimelinePanel } from './react/ui/TimelinePanel';
import { Toast } from './react/ui/Toast';
import { Toolbar } from './react/ui/Toolbar';

const KEYBINDINGS: Record<string, string> = {
    'KeyW': 'move:forward',
    'KeyS': 'move:backward',
    'KeyA': 'move:left',
    'KeyD': 'move:right',
    'Space': 'move:up',
    'ShiftLeft': 'move:down',
    'KeyE': 'action:extrude',
    'KeyP': 'action:split_edge',
    'Tab': 'editor:toggle',
    'KeyX': 'action:delete_object',
    'Delete': 'action:delete_object',
    'Backspace': 'action:delete_object',
    'KeyZ': 'system:undo',
    'KeyY': 'system:redo',
    'KeyG': 'tool:translate',
    'KeyR': 'tool:rotate',
    'KeyC': 'tool:scale'
};

/** How often the scene is pushed to the backend as a snapshot (the log stays the truth). */
const SNAPSHOT_INTERVAL_MS = 15_000;
/** Small wait so the last snapshot frame is on the wire before the session is closed. */
const SNAPSHOT_SETTLE_MS = 150;

interface Boot
{
    /** Built only after the lobby finishes: the replica lives for the rest of the session. */
    replica: ReplicaSession;
    session: Session | null;
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function App()
{
    const [boot, setBoot] = useState<Boot | null>(null);

    useEffect(() =>
    {
        if (!boot)
            return;

        const inputManager = new InputManager(KEYBINDINGS);
        inputManager.init();

        return () => inputManager.destroy();
    }, [boot]);

    /**
     * The backend does not fold the operation log, so a client sends it the materialized
     * scene now and then. It is only a denormalisation (reopening a session, inspecting
     * it): if it ever diverges, the log wins.
     */
    useEffect(() =>
    {
        const { replica, session } = boot ?? {};
        if (!replica || !session)
            return;

        const push = () =>
        {
            if (replica.log.all().length === 0)
                return;

            session.transport.send({
                type: 'scene_snapshot',
                snapshot: buildSceneSnapshot(replica.state, replica.log.versionVector())
            });
        };

        const timer = window.setInterval(push, SNAPSHOT_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [boot]);

    const onExit = useCallback(async () =>
    {
        const session = boot?.session;
        const replica = boot?.replica;

        if (session && replica && replica.log.all().length > 0)
        {
            session.transport.send({
                type: 'scene_snapshot',
                snapshot: buildSceneSnapshot(replica.state, replica.log.versionVector())
            });
        }

        if (session?.sessionId !== undefined && session.userId !== undefined)
        {
            await sleep(SNAPSHOT_SETTLE_MS);

            try
            {
                // Ending is the host's call; a guest only leaves (the backend answers 403).
                if (session.role === 'host')
                    await endSession(session.sessionId, session.userId);
                else
                    await leaveSession(session.sessionId, session.userId);
            }
            catch
            {
                // Leaving must never trap the user in the editor.
            }
        }

        session?.transport.close();
        setBoot(null);
    }, [boot]);

    return (
        <AppRoutes
            onStart={(session) =>
            {
                if (session)
                    GLOBAL_BUS.emit('network:connected', session);

                setBoot({ replica: new ReplicaSession(), session });
            }}
            onExit={onExit}
            renderEditor={({ leave }) => boot && (
                <>
                    <Viewport3D replica={boot.replica} session={boot.session} />
                    <Toolbar />
                    {boot.session && <ChatPanel session={boot.session} />}
                    <Toast />
                    <TimelinePanel log={boot.replica.log} />
                    <EditorOverlay onLeave={leave} />
                </>
            )}
        />
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
