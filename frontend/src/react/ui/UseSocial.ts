import { useCallback, useState } from 'react';

/**
 * Front-end only: every function below fakes a server with local state and short delays.
 * When the backend exists, keep the signatures and replace the bodies with real API calls.
 * Functions that can fail resolve to an error message (or null on success), so the UI never
 * needs try/catch.
 */

export type FriendStatus = 'hosting' | 'online' | 'offline';

export interface User
{
    id: string;
    name: string;
}

export interface Friend
{
    id: string;
    name: string;
    status: FriendStatus;
}

export interface FriendRequest
{
    id: string;
    name: string;
}

export interface Social
{
    user: User | null;
    friends: Friend[];
    requests: FriendRequest[];
    login: (name: string, password: string) => Promise<string | null>;
    register: (name: string, password: string) => Promise<string | null>;
    logout: () => void;
    addFriend: (name: string) => Promise<string | null>;
    removeFriend: (id: string) => void;
    acceptRequest: (id: string) => void;
    declineRequest: (id: string) => void;
}

const STORAGE_KEY = 'blenderpds:user';

const SAMPLE_FRIENDS: Friend[] = [
    { id: 'marina', name: 'Marina', status: 'hosting' },
    { id: 'caio', name: 'Caio', status: 'online' },
    { id: 'julia', name: 'Júlia', status: 'online' },
    { id: 'rafael', name: 'Rafael', status: 'offline' },
    { id: 'beatriz', name: 'Beatriz', status: 'offline' }
];

const SAMPLE_REQUESTS: FriendRequest[] = [{ id: 'thiago', name: 'Thiago' }];

function loadUser(): User | null
{
    try
    {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as User) : null;
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
        // Storage can be blocked; the session simply will not survive a refresh.
    }
}

const wait = (ms = 400) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function useSocial(): Social
{
    const [user, setUser] = useState<User | null>(loadUser);
    const [friends, setFriends] = useState<Friend[]>(SAMPLE_FRIENDS);
    const [requests, setRequests] = useState<FriendRequest[]>(SAMPLE_REQUESTS);

    const signIn = useCallback(async (name: string, password: string) =>
    {
        await wait();

        const trimmed = name.trim();
        if (trimmed.length < 3)
            return 'Username must have at least 3 characters.';
        if (password.length < 4)
            return 'Password must have at least 4 characters.';

        const next: User = { id: trimmed.toLowerCase(), name: trimmed };
        saveUser(next);
        setUser(next);
        return null;
    }, []);

    const logout = useCallback(() =>
    {
        saveUser(null);
        setUser(null);
    }, []);

    const addFriend = useCallback(async (name: string) =>
    {
        await wait();

        const trimmed = name.trim();
        if (trimmed === '')
            return 'Type a username.';
        if (user && trimmed.toLowerCase() === user.id)
            return 'That is you.';
        if (friends.some((friend) => friend.id === trimmed.toLowerCase()))
            return `${trimmed} is already your friend.`;

        // A real server would store a pending request for the other user here.
        return null;
    }, [user, friends]);

    const removeFriend = useCallback((id: string) =>
    {
        setFriends((previous) => previous.filter((friend) => friend.id !== id));
    }, []);

    const acceptRequest = useCallback((id: string) =>
    {
        setRequests((previous) =>
        {
            const accepted = previous.find((request) => request.id === id);
            if (accepted)
                setFriends((list) => [...list, { id: accepted.id, name: accepted.name, status: 'online' }]);

            return previous.filter((request) => request.id !== id);
        });
    }, []);

    const declineRequest = useCallback((id: string) =>
    {
        setRequests((previous) => previous.filter((request) => request.id !== id));
    }, []);

    return {
        user,
        friends,
        requests,
        login: signIn,
        register: signIn,
        logout,
        addFriend,
        removeFriend,
        acceptRequest,
        declineRequest
    };
}