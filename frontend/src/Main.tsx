import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReplicaSession } from './collab/ReplicaSession';
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

interface Boot
{
    /** Built only after the lobby finishes: the replica lives for the rest of the session. */
    replica: ReplicaSession;
    session: Session | null;
}

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

    return (
        <AppRoutes
            onStart={(session) =>
            {
                if (session)
                    GLOBAL_BUS.emit('network:connected', session);

                setBoot({ replica: new ReplicaSession(), session });
            }}
            onExit={() =>
            {
                // TODO: close the connection here (something like boot?.session?.transport.close()),
                // otherwise the partner keeps seeing us as connected after we leave.
                setBoot(null);
            }}
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