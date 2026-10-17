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

const API_BASE = '/api';

export class ApiError extends Error
{
    public constructor(public readonly status: number, message: string)
    {
        super(message);
        this.name = 'ApiError';
    }
}

interface CsrfToken
{
    token: string;
    headerName: string;
}

let csrf: CsrfToken | null = null;

async function csrfToken(): Promise<CsrfToken>
{
    if (csrf)
        return csrf;

    const response = await fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' });
    if (!response.ok)
        throw new ApiError(response.status, 'Could not get a CSRF token from the server.');

    csrf = await response.json() as CsrfToken;
    return csrf;
}

/** Called after signing out: the next session gets a fresh token. */
export function resetCsrf(): void
{
    csrf = null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T>
{
    const method = (init.method ?? 'GET').toUpperCase();
    const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };

    if (init.body)
        headers['Content-Type'] = 'application/json';

    if (method !== 'GET' && method !== 'HEAD')
    {
        const { token, headerName } = await csrfToken();
        headers[headerName] = token;
    }

    const response = await fetch(`${API_BASE}${path}`, { ...init, method, headers, credentials: 'include' });

    if (!response.ok)
        throw new ApiError(response.status, await errorMessage(response));

    if (response.status === 204)
        return undefined as T;

    const text = await response.text();
    return (text === '' ? undefined : JSON.parse(text)) as T;
}

/** The backend answers errors with empty bodies; keep a readable message anyway. */
async function errorMessage(response: Response): Promise<string>
{
    const text = await response.text();
    if (text !== '')
    {
        try
        {
            const body = JSON.parse(text);
            return body.message ?? body.error ?? `${response.status}`;
        }
        catch
        {
            return text;
        }
    }

    switch (response.status)
    {
        case 400: return 'The server rejected the data.';
        case 401: return 'Your session expired. Sign in again.';
        case 403: return 'You are not allowed to do that.';
        case 404: return 'Not found.';
        case 409: return 'Conflicting state on the server.';
        default: return `Request failed (${response.status}).`;
    }
}

// ---------------- types (mirror of the backend DTOs) ----------------

export interface ApiUser
{
    id: number;
    nickname: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
}

export type ApiSessionStatus = 'WAITING' | 'ACTIVE' | 'ENDED';

export interface ApiSession
{
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

export interface ApiParticipant
{
    userId: number;
    nickname: string;
    active: boolean;
    joinedAt: string;
    lastSeenAt: string | null;
}

export interface ApiFriendRequest
{
    id: number;
    senderId: number;
    senderNickname: string;
    receiverId: number;
    receiverNickname: string;
    createdAt: string;
}

// ---------------- auth ----------------

export async function login(email: string, password: string): Promise<ApiUser>
{
    return request<ApiUser>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function logout(): Promise<void>
{
    try
    {
        await request<void>('/auth/logout', { method: 'POST' });
    }
    finally
    {
        resetCsrf();
    }
}

export async function register(nickname: string, email: string, password: string): Promise<ApiUser>
{
    return request<ApiUser>('/users', { method: 'POST', body: JSON.stringify({ nickname, email, password }) });
}

export async function confirmEmail(id: number): Promise<ApiUser>
{
    return request<ApiUser>(`/users/${id}/confirm-email`, { method: 'POST' });
}

// ---------------- friends ----------------

/**
 * The friend UI asks by nickname, but the API works with ids (and nicknames are not
 * unique), so the list is searched here. Fine for the size of a course project; a
 * dedicated search endpoint would be the next step.
 */
export async function findUserByNickname(nickname: string): Promise<ApiUser | null>
{
    const users = await request<ApiUser[]>('/users');
    const wanted = nickname.trim().toLowerCase();
    return users.find((user) => user.nickname.toLowerCase() === wanted) ?? null;
}

export async function listFriends(userId: number): Promise<ApiUser[]>
{
    return request<ApiUser[]>(`/users/${userId}/friends`);
}

export async function listFriendRequests(userId: number): Promise<ApiFriendRequest[]>
{
    return request<ApiFriendRequest[]>(`/users/${userId}/friend-requests`);
}

export async function sendFriendRequest(userId: number, receiverId: number): Promise<ApiFriendRequest>
{
    return request<ApiFriendRequest>(`/users/${userId}/friend-requests`,
        { method: 'POST', body: JSON.stringify({ receiverId }) });
}

export async function acceptFriendRequest(userId: number, requestId: number): Promise<ApiUser>
{
    return request<ApiUser>(`/users/${userId}/friend-requests/${requestId}/accept`, { method: 'POST' });
}

export async function rejectFriendRequest(userId: number, requestId: number): Promise<void>
{
    return request<void>(`/users/${userId}/friend-requests/${requestId}/reject`, { method: 'POST' });
}

export async function cancelFriendRequest(userId: number, requestId: number): Promise<void>
{
    return request<void>(`/users/${userId}/friend-requests/${requestId}`, { method: 'DELETE' });
}

export async function removeFriend(userId: number, friendId: number): Promise<void>
{
    return request<void>(`/users/${userId}/friends/${friendId}`, { method: 'DELETE' });
}

// ---------------- collaborative sessions ----------------

export async function createSession(hostId: number): Promise<ApiSession>
{
    return request<ApiSession>('/sessions', { method: 'POST', body: JSON.stringify({ hostId }) });
}

export async function getSession(sessionId: number): Promise<ApiSession>
{
    return request<ApiSession>(`/sessions/${sessionId}`);
}

/**
 * The room the host still has open, if any. A host may only have one open room, so the
 * hosting screen resumes this one instead of creating a second (which the backend
 * rejects with 409).
 */
export async function getOpenSession(userId: number): Promise<ApiSession | null>
{
    try
    {
        return await request<ApiSession>(`/sessions/open/${userId}`);
    }
    catch (error)
    {
        if (error instanceof ApiError && error.status === 404)
            return null;
        throw error;
    }
}

export async function getSessionByCode(code: string): Promise<ApiSession>
{
    return request<ApiSession>(`/sessions/code/${encodeURIComponent(code.trim())}`);
}

export async function joinSession(sessionId: number, userId: number): Promise<ApiSession>
{
    return request<ApiSession>(`/sessions/${sessionId}/join`, { method: 'POST', body: JSON.stringify({ userId }) });
}

export async function leaveSession(sessionId: number, userId: number): Promise<void>
{
    return request<void>(`/sessions/${sessionId}/leave`, { method: 'POST', body: JSON.stringify({ userId }) });
}

export async function endSession(sessionId: number, userId: number): Promise<void>
{
    return request<void>(`/sessions/${sessionId}/end`, { method: 'POST', body: JSON.stringify({ userId }) });
}

export async function listParticipants(sessionId: number): Promise<ApiParticipant[]>
{
    return request<ApiParticipant[]>(`/sessions/${sessionId}/participants`);
}

/** Active sessions hosted by this user's friends (the "Hosting" badge in the friends list). */
export async function listFriendsSessions(userId: number): Promise<ApiSession[]>
{
    return request<ApiSession[]>(`/sessions/friends/${userId}`);
}

/** Last scene snapshot stored for the session (404 while nobody pushed one). */
export async function getSessionState(sessionId: number): Promise<unknown | null>
{
    try
    {
        return await request<unknown>(`/sessions/${sessionId}/state`);
    }
    catch (error)
    {
        if (error instanceof ApiError && error.status === 404)
            return null;
        throw error;
    }
}
