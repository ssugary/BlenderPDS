import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '../../network/Session';
import { Lobby } from './Lobby';
import { MenuPage } from './MenuPage';
import { HostPage } from './HostPage';
import { JoinPage } from './JoinPage';
import { AuthPage, FriendsPage } from './SocialPage';
import { SocialProvider } from './SocialContext';

/** How long the lobby fades out before the editor route opens. Keep in sync with the 0.3s in Lobby.tsx. */
const LEAVE_MS = 300;

export interface EditorApi
{
    session: Session | null;
    /** Ends the session and returns to the lobby menu. */
    leave: () => void;
}

interface AppRoutesProps
{
    /** Runs once when the lobby finishes, right before the transition to the editor. */
    onStart?: (session: Session | null) => void;
    /** Runs once when the session ends, whether through leave() or the browser's back button. */
    onExit?: () => void;
    /** Renders the editor (Viewport3D, Toolbar, ChatPanel...) for the session chosen in the lobby. */
    renderEditor: (api: EditorApi) => ReactNode;
}

function RouteTree({ onStart, onExit, renderEditor }: AppRoutesProps)
{
    const navigate = useNavigate();
    const location = useLocation();

    const [started, setStarted] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    // Kept in refs so the callbacks below stay the same functions across renders and navigations;
    // the lobby pages list handleStart as an effect dependency and must not restart because of it.
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;
    const onStartRef = useRef(onStart);
    onStartRef.current = onStart;
    const onExitRef = useRef(onExit);
    onExitRef.current = onExit;

    // True from the click that starts the editor until the route actually changes, so a second
    // click cannot start twice and the guard below does not mistake the lobby for "left the editor".
    const startingRef = useRef(false);
    const timerRef = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    const handleStart = useCallback((next: Session | null) =>
    {
        if (startingRef.current)
            return;

        startingRef.current = true;
        onStartRef.current?.(next);
        setSession(next);
        setStarted(true);
        setLeaving(true); // the lobby fades out while this timer runs

        timerRef.current = window.setTimeout(() =>
        {
            navigateRef.current('/editor');
            setLeaving(false);
            startingRef.current = false;
        }, LEAVE_MS);
    }, []);

    const endSession = useCallback(() =>
    {
        onExitRef.current?.();
        setStarted(false);
        setSession(null);
    }, []);

    const handleLeave = useCallback(() =>
    {
        endSession();
        navigateRef.current('/', { replace: true });
    }, [endSession]);

    // The browser's back button (or any link) can leave /editor without going through handleLeave.
    // Without this the session would keep running, with its shortcuts bound, behind the lobby.
    useEffect(() =>
    {
        if (started && !startingRef.current && location.pathname !== '/editor')
            endSession();
    }, [location.pathname, started, endSession]);

    return (
        <Routes>
            <Route element={<Lobby onStart={handleStart} leaving={leaving} />}>
                <Route index element={<MenuPage />} />
                <Route path="login" element={<AuthPage />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="host" element={<HostPage />} />
                <Route path="join" element={<JoinPage />} />
            </Route>

            {/* Opening /editor directly (or refreshing it) has no session, so go through the lobby first. */}
            <Route
                path="/editor"
                element={started ? renderEditor({ session, leave: handleLeave }) : <Navigate to="/" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/** Router, social state and every route of the app. Wrap nothing else around it. */
export function AppRoutes(props: AppRoutesProps)
{
    return (
        <BrowserRouter>
            <SocialProvider>
                <RouteTree {...props} />
            </SocialProvider>
        </BrowserRouter>
    );
}