# BlenderPDS - Collaborative sessions on the backend

This replaces "two peers exchanging offer/answer codes" with "a room on the server".
The CRDT did not move: the client still owns `Operation`, `OpLog`, `DocumentState` and
`SceneProjector`. What changed is who sequences and stores the operations.

```
  host client ─┐                                     ┌─ Postgres
               ├─ WebSocket /ws/sessions/{id} ─ SessionSocketHandler ─ sessions
  guest client ┘        (JSON frames)             └─ session_operations (append-only)
                                                       session_participants
```

## The one rule that shapes everything

> **The backend does not implement the CRDT.** It validates the shape of each operation,
> assigns a global `seq` per session, drops duplicates and stores the raw JSON.

It never merges, never resolves last-writer-wins and never computes tombstones. A Java
mirror of `DocumentState` would have to be kept in sync with the client forever, and it
would break the moment the client gained a new operation kind. Because the server only
orders, `frontend/src/collab/validate.ts` stays the single source of truth for what an
operation looks like — `OperationValidator` mirrors it and must follow it when it grows.

What the server does buy is a **total order**. The old design relied on the ordered data
channel and on there being exactly two peers; with a sequencer in the middle, N
participants work and the client's `DocumentState` never receives an operation for an
object it has not seen yet.

## Data model

| Table | What it holds |
|---|---|
| `sessions` | host, `status` (WAITING/ACTIVE/ENDED), shareable `code`, opaque `scene_snapshot`, timestamps |
| `session_participants` | one row per (session, user) with `active` + `last_seen_at` — presence has its own state, which is why it is an entity and not a `@ManyToMany` |
| `session_operations` | the log: `seq`, `site_id`, `lamport`, `author`, `kind`, `payload` (raw JSON) |

Two unique constraints carry the guarantees: `(session_id, seq)` for the server order and
`(session_id, site_id, lamport)` for idempotency — resending an operation after a
reconnect (or a retry) can never duplicate it.

`scene_snapshot` is written by a **client** (`POST`… no, over the socket): the server
cannot compute it, precisely because it does not fold the log. It is only a
denormalisation for reopening or inspecting a session; the log always wins.

## Lifecycle

- `WAITING` — created, nobody connected. Friends do not see it as "hosting" yet.
- `ACTIVE` — at least one participant connected. This is what the friends list shows,
  and what makes the Join button appear.
- `ENDED` — the host closed it. Nothing else can join and the open sockets are dropped.
  The scene stays in the database.

A host has at most one open session (409 otherwise). Leaving the editor as host calls
`POST /sessions/{id}/end`; a guest calls `/leave`, which frees their slot and puts the
room back to `WAITING` when nobody is left.

## Who may connect

Only friends of the host — enforced on the server, not by hiding buttons:

1. `SessionHandshakeInterceptor` runs **before** the WebSocket upgrade and rejects the
   handshake with 403 (not a friend), 404 (unknown session/user) or 409 (ended or full).
2. It also marks the participant connected in the same locked transaction, so two
   simultaneous handshakes cannot both slip past the 4-participant limit.
3. `appendOperations` re-checks that the sender is still an active participant, so a
   connection that somehow outlives its membership cannot write to the log.

## Wire protocol

Same message shapes the client already used peer-to-peer, plus a few new ones. Unknown
types are ignored by the client (every listener switches on `type`), which is what keeps
this backwards compatible.

| Client → server | Server → client |
|---|---|
| `sync_hello {vv}` | `sync_ops {ops:[…]}` — catch-up and live relay (ops carry `seq`) |
| `sync_ops {ops:[…]}` — one local operation | `sync_ack {siteId, lamport, seq}` |
| `presence {siteId, selectedObjectId}` | `session_roster {sessionId, status, participants[]}` |
| `chat {text}` | `presence`, `chat` (relayed only) |
| `scene_snapshot {snapshot}` | `error {code}` |

`presence` and `chat` are ephemeral: relayed, never stored. The roster is what the chat
panel uses to show a real number of players.

**Ordering rule.** Appending and broadcasting happen inside the same per-session lock,
so the order of `seq` and the order of delivery are identical. Without that, an operation
that depends on another (moving an object another participant just created) could arrive
first and be dropped by `DocumentState.apply`.

**Catch-up rule.** A new connection starts in "catching up" mode: frames that arrive
before its initial log has been flushed wait in a queue (`SessionConnection`) and are
delivered right after. This is what prevents a broadcast from interleaving with the
catch-up and losing an edit for the newcomer.

**Reconnect.** `WebSocketTransport` queues frames while the socket is down and, on
reopen, replays the last `sync_hello` followed by the queued operations. A stale version
vector is harmless (the server sends a few extra operations and the `OpLog` drops
duplicates), and the queued operations are sequenced after the catch-up.

## REST surface

| Route | Purpose |
|---|---|
| `POST /sessions` | create the room (409 when the host already has one open) |
| `GET /sessions/{id}` · `GET /sessions/code/{code}` | details, and lookup by the shared code |
| `GET /sessions/{id}/participants` | roster |
| `POST /sessions/{id}/join` · `/leave` · `/end` | enter (403 for non-friends), leave, close (host only) |
| `GET /sessions/friends/{userId}` | active sessions of the user's friends — the "hosting" badge |
| `GET /sessions/{id}/state` | last stored snapshot |

REST does not carry operations: they go over the socket. These routes exist to make the
lobby screens work and to give clear errors before a socket is opened.

## Authentication

`POST /auth/login` (e-mail + password) stores the Spring Security context in the HTTP
session. The browser then sends the JSESSIONID cookie by itself — including on the
WebSocket upgrade, which is the whole reason the login is cookie-based: **no browser API
can set a header on a WebSocket handshake**.

Mutations need a CSRF token, obtained from `GET /auth/csrf` (returned in the body, so the
client never depends on which CSRF repository the server uses) and echoed in the header
name that endpoint advertises. The front caches both.

Registration is public (otherwise nobody could create the first account) and the login is
refused until the e-mailed link is clicked — `UserDetailsServiceImpl` marks the account
disabled until then.

## Known limits

- The connection registry lives in memory: one backend instance. Scaling out needs a
  broker instead of `SessionConnectionRegistry`.
- `?userId=` in the socket URL and `{id}` in the REST paths are the actor, as in the
  friends API. When the domain gets real identity, the actor comes from the authenticated
  principal and the cookie already carries it.
- Plain "online" (idle, not hosting) has no presence source yet, so a friend is either
  hosting or offline.
- Nothing rehydrates the scene from `scene_snapshot` yet: reopening a session still
  replays the log (`DocumentState` has no `fromSnapshot`).
