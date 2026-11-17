# App do editor — `apps/design-editor/web`

SPA React + TypeScript + three.js que desenha o editor, o lobby e os painéis da sessão.
É o workspace npm `blenderpds`; instruções completas (backend, banco, contas) estão no
[README da raiz](../../../README.md).

## Rodando

```bash
# backend, na raiz do repositório (Docker ativo):
./mvnw -pl apps/design-editor/backend spring-boot:run

# frontend, na raiz:
npm install
npm run dev -w blenderpds        # http://localhost:5173
```

O Vite faz proxy de `/api` e `/ws` para `http://localhost:8080` (ou `BACKEND_URL`).

```bash
npm run build -w blenderpds      # tsc strict + build de produção
npm test -w blenderpds           # Vitest
npm run preview -w blenderpds    # serve o build
```

Requisitos: **Node.js 22** (`^20.19` ou `>=22.12`), **Java 21** e **Docker** para o backend.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/core/` | `createEditorApp` (montagem sobre `createCollabApp`), `EventBus` e os controladores de gesto/seleção/ação |
| `src/collab/` | Operações do editor, `ReplicaSession`, fachada do `DocumentState`, projeção, snapshot e presença |
| `src/kinds/` | Os kinds do editor e os contratos compartilhados com o backend |
| `src/format/` | `ObjImporter`, `ObjExporter` e o registro de formatos |
| `src/manager/` | Seleção, ferramentas, histórico de comandos e modo do editor |
| `src/tool/`, `src/command/`, `src/entity/` | Ferramentas, comandos com undo e a malha half-edge |
| `src/react/` | Viewport, rotas, toolbar, timeline e overlay |
| `src/integration/` | Teste de integração com duas réplicas reais |

O que é genérico (CRDT, transporte, presença, protocolo, cena/render, lobby/social/chat) vem de
`@collab3d/core` e `@collab3d/react-kit`; esta aplicação só registra o domínio do editor.

## Documentação

- [Arquitetura versionada](../../../docs/architecture/README.md) — snapshots por fase.
- [Notas de refatoração](../../../docs/refactor-notes.md) — decisões e dívidas.
- [Protocolo WebSocket](../../../docs/ws-protocol.md).
