/**
 * REST client for the Spring backend.
 *
 * Everything goes through `/api` (the Vite proxy in dev, same origin in production)
 * WITH credentials: the Spring Security session lives in a JSESSIONID cookie, and
 * that cookie is what authenticates both these calls and the WebSocket handshake —
 * a browser cannot set headers on a WebSocket upgrade, but it always sends cookies.
 *
 * Mutations need the CSRF token, which the backend hands out (in the body, not in a
 * cookie) in `GET /auth/csrf`. It is fetched once and cached; the header NAME comes
 * from the backend too, so the client can never disagree with the server about it.
 */
/**
 * Points the client somewhere other than the same-origin `/api` proxy (an app embedding the
 * framework, a test server, a different deployment path). Call it once, before any request.
 */
export declare function configureBackend(options: {
    baseUrl: string;
}): void;
/** A failed backend call: `status` is the HTTP code and the message is already human-readable. */
export declare class ApiError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
/** Called after signing out: the next session gets a fresh token. */
export declare function resetCsrf(): void;
export interface ApiUser {
    id: number;
    nickname: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
}
export type ApiSessionStatus = 'WAITING' | 'ACTIVE' | 'ENDED';
export interface ApiSession {
    id: number;
    code: string;
    status: ApiSessionStatus;
    hostId: number;
    hostNickname: string;
    participantCount: number;
    maxParticipants: number;
    createdAt: string;
    updatedAt: string | null;
    endedAt: string | null;
}
export interface ApiParticipant {
    userId: number;
    nickname: string;
    active: boolean;
    joinedAt: string;
    lastSeenAt: string | null;
}
export interface ApiFriendRequest {
    id: number;
    senderId: number;
    senderNickname: string;
    receiverId: number;
    receiverNickname: string;
    createdAt: string;
}
export declare function login(email: string, password: string): Promise<ApiUser>;
export declare function logout(): Promise<void>;
export declare function register(nickname: string, email: string, password: string): Promise<ApiUser>;
export declare function confirmEmail(id: number): Promise<ApiUser>;
/**
 * The friend UI asks by nickname, but the API works with ids (and nicknames are not
 * unique), so the list is searched here. Fine for the size of a course project; a
 * dedicated search endpoint would be the next step.
 */
export declare function findUserByNickname(nickname: string): Promise<ApiUser | null>;
export declare function listFriends(userId: number): Promise<ApiUser[]>;
export declare function listFriendRequests(userId: number): Promise<ApiFriendRequest[]>;
export declare function sendFriendRequest(userId: number, receiverId: number): Promise<ApiFriendRequest>;
export declare function acceptFriendRequest(userId: number, requestId: number): Promise<ApiUser>;
export declare function rejectFriendRequest(userId: number, requestId: number): Promise<void>;
export declare function cancelFriendRequest(userId: number, requestId: number): Promise<void>;
export declare function removeFriend(userId: number, friendId: number): Promise<void>;
export declare function createSession(hostId: number): Promise<ApiSession>;
export declare function getSession(sessionId: number): Promise<ApiSession>;
/**
 * The room the host still has open, if any. A host may only have one open room, so the
 * hosting screen resumes this one instead of creating a second (which the backend
 * rejects with 409).
 */
export declare function getOpenSession(userId: number): Promise<ApiSession | null>;
export declare function getSessionByCode(code: string): Promise<ApiSession>;
export declare function joinSession(sessionId: number, userId: number): Promise<ApiSession>;
export declare function leaveSession(sessionId: number, userId: number): Promise<void>;
export declare function endSession(sessionId: number, userId: number): Promise<void>;
export declare function listParticipants(sessionId: number): Promise<ApiParticipant[]>;
/** Active sessions hosted by this user's friends (the "Hosting" badge in the friends list). */
export declare function listFriendsSessions(userId: number): Promise<ApiSession[]>;
/** Last scene snapshot stored for the session (404 while nobody pushed one). */
export declare function getSessionState(sessionId: number): Promise<unknown | null>;
//# sourceMappingURL=BackendClient.d.ts.map