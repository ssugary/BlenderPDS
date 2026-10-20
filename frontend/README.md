# Frontend — BlenderPDS

React + TypeScript + three.js SPA that renders the editor, the lobby and the session panels.
Full instructions (backend, database, accounts and tests) are in the
[root README](../README.md).

## Running

```bash
npm install
npm run dev      # http://localhost:5173
```

Vite proxies `/api` and `/ws` to `http://localhost:8080` (or to `BACKEND_URL`, when set).

```bash
npm run build    # typecheck (tsc strict) + production build
npm run preview  # serves the build
```

Requires Node.js `^20.19` or `>=22.12`.

## Structure

| Folder | Contents |
|---|---|
| `src/core/` | `Engine` (composition root), `EventBus`, `RenderEngine` and the gesture, selection and action controllers |
| `src/collab/` | Operations, `OpLog`, `DocumentState`, scene projection, sync and presence |
| `src/manager/` | Scene, camera, input, selection, tools and the command stack |
| `src/entity/` | Half-edge mesh, editor modes, navigation and selection strategies |
| `src/tool/`, `src/command/` | Tools and commands with undo/redo |
| `src/network/` | `Transport` contract, `WebSocketTransport` and the editor session |
| `src/react/` | 3D viewport and UI (lobby, toolbar, chat, timeline) |

## Documentation

- [Frontend architecture](../docs/frontend-architecture.md) — editor core, CRDT and collaboration data flow
- [Backend architecture](../docs/backend-architecture.md) — REST surface, WebSocket protocol and data model
- [Backlog](backlog.md)
