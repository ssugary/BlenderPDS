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
export interface User {
    id: number;
    name: string;
    email: string;
}
export interface Friend {
    id: number;
    name: string;
    status: FriendStatus;
}
export interface FriendRequest {
    id: number;
    name: string;
}
export interface Social {
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
export declare function useSocial(): Social;
//# sourceMappingURL=UseSocial.d.ts.map