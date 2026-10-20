# BlenderPDS

Browser-based 3D modeling editor with real-time collaborative editing. The front end is a
React + three.js SPA; the Spring Boot backend stores users, friends and sessions, sequences
the operations and relays whatever each participant is still missing.

Course project for **Projeto Detalhado de Software — Grupo 03**.

## Features

**Modeling**

- Primitives: cube, cylinder, torus, sphere and capsule.
- Transform gizmo: move (`G`), rotate (`R`) and scale (`C`).
- Mesh edit mode (`Tab`): vertex, edge and face selection; coplanar faces are selected together.
- Extrude (`E`) and edge split (`P`).
- Object color through the color picker.
- `.obj` import and scene export to `.obj`.
- Undo/redo (`Z`/`Y`) through the command stack.

**Collaboration**

- Hosted session with a shareable code; join by code or from the friends list.
- Operations replicated as a CRDT (Lamport clock + LWW registers): arrival order does not
  change the result.
- Reconnection with version-vector exchange: each side sends only what the other lacks.
- Presence and selection lock (warns when another player already selected the object).
- Session chat and an edit timeline with a scrubber.
- Periodic scene snapshot for inspecting the session; the log remains the source of truth and
  reopening still replays it.

**Accounts and friends**

- Sign-up with e-mail confirmation and session login (cookie `JSESSIONID`).
- Friend requests; only the host's friends may join the session.

## Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript 7, Vite 8, three.js 0.161, React Router 7 |
| Backend | Java 21, Spring Boot 4.1.1 (Web MVC, Security, Data JPA, WebSocket, Mail), Maven |
| Data | PostgreSQL 16 (Docker Compose) |
| E-mail (dev) | Mailpit — UI at `http://localhost:8025` |
| Tests | JUnit + Spring Boot Test on the backend |

## Repository layout

```
PDS/
├── backend/blenderpds/
│   ├── src/main/java/com/grupo03/blenderpds/
│   │   ├── config/         # security, WebSocket, auditing
│   │   ├── controller/     # REST: auth, users, friends, sessions
│   │   ├── service/        # business rules
│   │   ├── websocket/      # handshake, connections, validation and operation relay
│   │   ├── model/          # JPA entities
│   │   └── repository/     # Spring Data
│   ├── src/test/java/      # controller, service, model and WebSocket tests
│   ├── docs/               # layered architecture
│   └── compose.yaml        # Postgres 16 + Mailpit
└── frontend/
    ├── src/api/            # REST client (session + CSRF)
    ├── src/collab/         # CRDT: operations, log, state, sync, presence
    ├── src/core/           # Engine (composition root), EventBus, controllers
    ├── src/entity/         # half-edge mesh, modes and navigation
    ├── src/manager/        # scene, camera, selection, tools, commands, input
    ├── src/network/        # Transport contract and WebSocketTransport
    ├── src/tool/           # tools
    ├── src/command/        # commands with undo
    ├── src/react/          # viewport and UI (lobby, toolbar, chat, timeline)
    └── docs/               # architecture and protocol
```

## Running locally (development)

Prerequisites:

- Node.js `^20.19` or `>=22.12` (the project was developed with Node 22).
- JDK 21 on the `PATH` (or `JAVA_HOME` pointing at it — `./mvnw` needs one of the two).
- Docker running (the backend starts Postgres and Mailpit through `compose.yaml`).

**1. Backend**

```bash
cd backend/blenderpds
./mvnw spring-boot:run
```

Spring Boot Docker Compose starts Postgres and Mailpit automatically. The API listens on
`http://localhost:8080` and the mail UI on `http://localhost:8025`.

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` and `/ws` to the backend, so the browser sees
a single origin — that is what keeps the session cookie valid during the WebSocket handshake
as well.

**3. First access**

Create an account on the sign-up screen. Login is only enabled after confirming the e-mail:
open Mailpit at `http://localhost:8025`, click the confirmation link and come back to the app.

The lobby's **Offline** mode opens the editor without a session; edits stay in that browser only.

## Environment variables

Backend (all optional in development, with the defaults below):

| Variable | Default | Purpose |
|---|---|---|
| `MAIL_HOST` / `MAIL_PORT` | `localhost` / `1025` | SMTP server (Mailpit in dev) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | empty | SMTP credentials, if any |
| `MAIL_SMTP_AUTH` / `MAIL_SMTP_STARTTLS` | `false` | SMTP TLS/authentication switches |
| `MAIL_FROM` | `no-reply@blenderpds.local` | Sender of the e-mails |
| `APP_BASE_URL` | `http://localhost:8080` | Base of the confirmation link |
| `WS_ALLOWED_ORIGINS` | `http://localhost:5173`, `http://127.0.0.1:5173`, `http://*:5173` | Origins accepted in the WebSocket handshake |

Frontend:

| Variable | Default | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` | Vite proxy target; in production the app calls the same origin |

## API and protocol

The REST API covers what happens before and after a session: authentication (`/auth/login`,
`/auth/logout`, `/auth/csrf`), users (`/users`, e-mail confirmation), friends
(`/users/{id}/friends` and the requests under `/users/{id}/friend-requests`) and rooms
(`/sessions`, `/sessions/{id}/join`, `/sessions/{id}/leave`, `/sessions/{id}/end`,
`/sessions/{id}/participants`, `/sessions/friends/{userId}`).

Mutations require the CSRF token served by `GET /auth/csrf`, echoed in the header the endpoint
itself advertises. Collaborative operations do **not** go through REST: they travel as JSON
over `ws://<origin>/ws/sessions/{id}` (in dev Vite forwards `/ws` to the backend), and the
server only validates the format, orders (`seq`) and stores them — merging is the client's job.

Protocol details, the data model and the join rules are in
[`frontend/docs/session-backend.md`](frontend/docs/session-backend.md).

## Build and tests

Frontend:

```bash
cd frontend
npm run build     # tsc (strict) + vite build
npm run preview   # serves the production build
```

The front end has no test runner configured yet; the automated check is the typecheck in `build`.

Backend:

```bash
cd backend/blenderpds
./mvnw test
```

The tests use the Postgres from `compose.yaml` (and Mailpit for the confirmation test), so
Docker must be running.

## Documentation

- [`backend/blenderpds/docs/architecture.md`](backend/blenderpds/docs/architecture.md) — backend layers and the path of one operation.
- [`frontend/docs/architecture.md`](frontend/docs/architecture.md) — class diagrams of the engine, tools, commands, modes and networking.
- [`frontend/docs/crdt-architecture.md`](frontend/docs/crdt-architecture.md) — operation model, conflict rules and CRDT implementation order.
- [`frontend/docs/session-backend.md`](frontend/docs/session-backend.md) — sessions on the server, WebSocket protocol, authentication and limits.
- [`frontend/backlog.md`](frontend/backlog.md) — what remains for the next sprints.

## Known limitations

- The WebSocket connection registry lives in memory: one backend instance. Horizontal scaling
  requires a broker.
- `scene_snapshot` is a denormalisation; reopening a session still replays the log (there is no
  `fromSnapshot`).
- Friends appear as "hosting" or offline — there is no "online" presence outside a session.
- Imported `.obj` models are local: they do not enter the log, do not sync and have no undo.
- Concurrent extrude/split on the same mesh has no topology merge; the selection lock is advisory.
- The front end has no automated tests.
