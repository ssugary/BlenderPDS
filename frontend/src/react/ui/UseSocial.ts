import { useCallback, useEffect, useState } from 'react';
import {
    ApiError,
    acceptFriendRequest,
    findUserByNickname,
    listFriendRequests,
    listFriends,
    listFriendsSessions,
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    rejectFriendRequest,
    removeFriend as apiRemoveFriend,
    sendFriendRequest
} from '../../api/Backend';

/**
 * Account and friends state, backed by the real API.
 *
 * The signatures are the ones the UI already used when this was a fake; what changed
 * is that the bodies now talk to the backend. Two behaviours worth knowing:
 *
 * - the signed-in user is cached in localStorage (the session cookie authenticates the
 *   requests, the cache only avoids an empty header on a refresh), and a 401 from any
 *   call signs the user out locally;
 * - "hosting" is real: it comes from the friends' ACTIVE sessions, so the badge and the
 *   Join button mean the friend really is in a room right now. Plain "online" (idle, not
 *   hosting) has no source yet, so friends are either hosting or offline.
 */

export type FriendStatus = 'hosting' | 'online' | 'offline';

export interface User
{
    id: number;
    name: string;
    email: string;
}

export interface Friend
{
    id: number;
    name: string;
    status: FriendStatus;
}

export interface FriendRequest
{
    id: number;
    name: string;
}

export interface Social
{
    user: User | null;
    friends: Friend[];
    requests: FriendRequest[];
    /** True when the last load failed (offline backend, expired session...). */
    loading: boolean;
    login: (email: string, password: string) => Promise<string | null>;
    /** Creates the account; the backend requires the e-mailed confirmation before signing in. */
    register: (nickname: string, email: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
    addFriend: (nickname: string) => Promise<string | null>;
    removeFriend: (id: number) => Promise<string | null>;
    acceptRequest: (id: number) => Promise<string | null>;
    declineRequest: (id: number) => Promise<string | null>;
    refresh: () => Promise<void>;
}

const STORAGE_KEY = 'blenderpds:user';
const REFRESH_INTERVAL_MS = 15_000;

function loadUser(): User | null
{
    try
    {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;

        const parsed = JSON.parse(raw) as User;
        return typeof parsed?.id === 'number' && typeof parsed?.name === 'string' ? parsed : null;
    }
    catch
    {
        return null;
    }
}

function saveUser(user: User | null): void
{
    try
    {
        if (user)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else
            localStorage.removeItem(STORAGE_KEY);
    }
    catch
    {
        // Storage can be blocked; the session cookie still keeps the user signed in.
    }
}

/** Turns whatever the API threw into something the UI can show. */
function describe(error: unknown): string
{
    if (error instanceof ApiError)
    {
        switch (error.status)
        {
            case 400: return 'Check the fields and try again.';
            case 401: return 'Invalid e-mail or password.';
            case 403: return 'You are not allowed to do that.';
            case 404: return 'Not found.';
            case 409: return 'That conflicts with something already on the server.';
            default: return error.message;
        }
    }

    return 'Could not reach the server. Is the backend running?';
}

export function useSocial(): Social
{
    const [user, setUser] = useState<User | null>(loadUser);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const signOutLocally = useCallback(() =>
    {
        saveUser(null);
        setUser(null);
        setFriends([]);
        setRequests([]);
    }, []);

    /** Friends + pending requests + which friends are hosting, in one round trip each. */
    const refresh = useCallback(async () =>
    {
        if (!user)
            return;

        setLoading(true);
        try
        {
            const [friendUsers, pending, sessions] = await Promise.all([
                listFriends(user.id),
                listFriendRequests(user.id),
                listFriendsSessions(user.id)
            ]);

            const hosting = new Set(sessions.map((session) => session.hostId));

            setFriends(friendUsers.map((friend) => ({
                id: friend.id,
                name: friend.nickname,
                status: hosting.has(friend.id) ? 'hosting' : 'offline'
            })));

            setRequests(pending.map((request) => ({ id: request.id, name: request.senderNickname })));
        }
        catch (error)
        {
            if (error instanceof ApiError && error.status === 401)
                signOutLocally();
        }
        finally
        {
            setLoading(false);
        }
    }, [user, signOutLocally]);

    useEffect(() =>
    {
        if (!user)
            return;

        void refresh();
        const timer = window.setInterval(() => { void refresh(); }, REFRESH_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [user, refresh]);

    const login = useCallback(async (email: string, password: string) =>
    {
        try
        {
            const account = await apiLogin(email.trim(), password);
            const next: User = { id: account.id, name: account.nickname, email: account.email };
            saveUser(next);
            setUser(next);
            return null;
        }
        catch (error)
        {
            return describe(error);
        }
    }, []);

    const register = useCallback(async (nickname: string, email: string, password: string) =>
    {
        try
        {
            await apiRegister(nickname.trim(), email.trim(), password);
            return null;
        }
        catch (error)
        {
            if (error instanceof ApiError && error.status === 409)
                return 'That e-mail is already registered.';
            return describe(error);
        }
    }, []);

    const logout = useCallback(async () =>
    {
        try
        {
            await apiLogout();
        }
        catch
        {
            // Even if the server call fails, the user leaves the UI.
        }
        signOutLocally();
    }, [signOutLocally]);

    const addFriend = useCallback(async (nickname: string) =>
    {
        if (!user)
            return 'Sign in first.';

        const trimmed = nickname.trim();
        if (trimmed === '')
            return 'Type a nickname.';

        try
        {
            const target = await findUserByNickname(trimmed);
            if (!target)
                return `No user called ${trimmed}.`;
            if (target.id === user.id)
                return 'That is you.';

            await sendFriendRequest(user.id, target.id);
            return null;
        }
        catch (error)
        {
            if (error instanceof ApiError && error.status === 409)
                return `You already have a pending request with ${trimmed} (or you are already friends).`;
            if (error instanceof ApiError && error.status === 403)
                return 'Confirm your e-mail before adding friends.';
            return describe(error);
        }
    }, [user]);

    const removeFriend = useCallback(async (id: number) =>
    {
        if (!user)
            return 'Sign in first.';

        try
        {
            await apiRemoveFriend(user.id, id);
            await refresh();
            return null;
        }
        catch (error)
        {
            return describe(error);
        }
    }, [user, refresh]);

    const acceptRequest = useCallback(async (id: number) =>
    {
        if (!user)
            return 'Sign in first.';

        try
        {
            await acceptFriendRequest(user.id, id);
            await refresh();
            return null;
        }
        catch (error)
        {
            return describe(error);
        }
    }, [user, refresh]);

    const declineRequest = useCallback(async (id: number) =>
    {
        if (!user)
            return 'Sign in first.';

        try
        {
            await rejectFriendRequest(user.id, id);
            await refresh();
            return null;
        }
        catch (error)
        {
            return describe(error);
        }
    }, [user, refresh]);

    return {
        user,
        friends,
        requests,
        loading,
        login,
        register,
        logout,
        addFriend,
        removeFriend,
        acceptRequest,
        declineRequest,
        refresh
    };
}
