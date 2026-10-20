# Frontend — BlenderPDS

SPA em React + TypeScript + three.js que renderiza o editor, o lobby e os painéis da sessão.
Instruções completas (backend, banco, contas e testes) estão no [README da raiz](../README.md).

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

O Vite faz proxy de `/api` e `/ws` para `http://localhost:8080` (ou para `BACKEND_URL`, se definido).

```bash
npm run build    # typecheck (tsc strict) + build de produção
npm run preview  # serve o build
```

Requer Node.js `^20.19` ou `>=22.12`.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/core/` | `Engine` (composition root), `EventBus`, `RenderEngine` e controllers de gesto, seleção e ações |
| `src/collab/` | Operações, `OpLog`, `DocumentState`, projeção para a cena, sync e presença |
| `src/manager/` | Cena, câmera, input, seleção, ferramentas e pilha de comandos |
| `src/entity/` | Malha half-edge, modos do editor, navegação e estratégias de seleção |
| `src/tool/`, `src/command/` | Ferramentas e comandos com undo/redo |
| `src/network/` | Contrato `Transport`, `WebSocketTransport` e a sessão do editor |
| `src/react/` | Viewport 3D e UI (lobby, toolbar, chat, timeline) |
| `docs/` | Diagramas de arquitetura e protocolo colaborativo |

## Documentação

- [Architecture](docs/architecture.md)
- [CRDT](docs/crdt-architecture.md)
- [Sessões no backend](docs/session-backend.md)
- [Backlog](backlog.md)
