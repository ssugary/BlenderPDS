# Frontend — BlenderPDS (`apps/design-editor/web`)

React + TypeScript + three.js SPA that renders the editor, the lobby and the session panels.
It is the `blenderpds` package of the npm workspace at the repo root; full instructions
(backend, database, accounts and tests) are in the [root README](../../../README.md).

## Running

```bash
npm install                # at the repo root, once — installs every workspace
npm run dev -w blenderpds  # http://localhost:5173
```

Vite proxies `/api` and `/ws` to `http://localhost:8080` (or to `BACKEND_URL`, when set).

```bash
npm run build -w blenderpds    # typecheck (tsc strict) + production build
npm test -w blenderpds         # Vitest (CRDT unit tests)
npm run preview -w blenderpds  # serves the build
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

- [Backend and frontend architecture (v0.0)](../../../docs/architecture/README.md) — snapshots of
  `docs/architecture/`, including the legacy guides `legacy/backend-architecture-v0.0.md` and
  `legacy/frontend-architecture-v0.0.md`
- [Refactor notes](../../../docs/refactor-notes.md)
