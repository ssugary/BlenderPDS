# Histórico de arquitetura — BlenderPDS → `collab3d`

Documentação de arquitetura **versionada e imutável**. Cada fase da refatoração produz um
arquivo NOVO com um snapshot completo e autossuficiente do repositório naquele momento
(seções 1–8 no formato do manifesto original). Nenhum snapshot anterior é editado,
renomeado ou apagado; este índice é o único arquivo deste diretório que pode ser atualizado.

- **Snapshot completo** = dá para entender o sistema lendo só aquele arquivo, sem abrir a
  versão anterior. A partir da v0.1, cada arquivo termina com a seção
  `# 9. DELTA EM RELAÇÃO À VERSÃO ANTERIOR`.
- **Opinião de correção factual:** só se aceita corrigir um snapshot anterior em caso de erro
  factual evidente, registrando data e motivo no cabeçalho do próprio arquivo.
- Os guias gerados nas fases (`docs/ws-protocol.md`, `docs/new-app-guide.md`,
  `docs/CHANGELOG.md`) são documentos **vivos**; eles não são snapshots.

## Versões

| Versão | Arquivo | Fase | Commit | Data | Resumo |
|---|---|---|---|---|---|
| v0.0 | [architecture-v0.0-baseline.md](architecture-v0.0-baseline.md) | baseline | `90b48ff` | 2026-11-17 | Estado ANTES da refatoração: editor BlenderPDS único (Spring Boot 4.1.1 + SPA React/three.js), CRDT no cliente, WebSocket sequenciado, sem Flyway e sem testes de frontend. |
| v0.1 | [architecture-v0.1-fase0-preparacao.md](architecture-v0.1-fase0-preparacao.md) | Fase 0 (P0.0–P0.7) | `a8e0244` | 2026-11-17 | Mesmo produto, com rede de segurança: arquitetura versionada, premissas verificadas, caracterização do WS, ArchUnit, Vitest, Flyway + `validate` e npm workspaces com o SPA em `apps/design-editor/web`. Nenhum contrato alterado. |
| v0.2 | [architecture-v0.2-fase1-core-backend.md](architecture-v0.2-fase1-core-backend.md) | Fase 1 (P1.1–P1.12) | `13e6686` | 2026-11-17 | Monorepo Maven com `framework/backend-starter` + `apps/design-editor/backend`; despachante WebSocket sobre `MessageCatalog`; validação genérica com `OperationKindRegistry` e os 4 kinds na aplicação; sequenciador, admissão por políticas, estado reduzido, cadeias de entrada/visibilidade, `sessions.app_type` (V2) e catch-up paginado. REST/WS/schema de operações compatíveis. |
| **v0.4** (VIGENTE) | [architecture-v0.4-fase3-seguranca-debitos.md](architecture-v0.4-fase3-seguranca-debitos.md) | Fase 3 (P2.fix, P3.0–P3.5) | `b80d5d5` | 2026-11-17 | Identidade sempre do `SecurityContext` (legado coincidente ignorado, divergente 403), rate limit com `RATE_LIMITED`, fan-out por `SessionBroadcaster`, busca de usuários em vez de listagem, `set_mesh`/undo compensatório, snapshot com envelope/checksum/reidratação (`sync_snapshot`), compose sem senha literal e CI. |
| v0.3 | [architecture-v0.3-fase2-core-frontend.md](architecture-v0.3-fase2-core-frontend.md) | Fase 2 (P2.1–P2.11) | `1c7f680` | 2026-11-17 | Frontend em três pacotes: `@collab3d/core` (CRDT genérico por registro de kinds, presença, protocolo por `MessageRegistry`, `SceneHost` e `createCollabApp`), `@collab3d/react-kit` (lobby, social, chat, toast) e o app só com o domínio do editor; contratos de kind compartilhados entre JUnit e Vitest. REST/WS/schema/banco inalterados. |

## Documentos legados (v0.0)

Cópias fiéis, com sufixo `-v0.0`, dos guias de arquitetura que existiam no commit `1c03688`
e foram removidos do repositório em `9fbbf44`. Ficam aqui como referência histórica.

| Arquivo | Conteúdo |
|---|---|
| [legacy/backend-architecture-v0.0.md](legacy/backend-architecture-v0.0.md) | Superfície REST, protocolo WebSocket e modelo de dados do backend original |
| [legacy/frontend-architecture-v0.0.md](legacy/frontend-architecture-v0.0.md) | Core do editor, CRDT e fluxo de colaboração do frontend original |

## Versões planejadas

| Versão | Arquivo previsto | Fase |
|---|---|---|
| v1.0 | `architecture-v1.0-fase4-aplicacoes.md` | fim da Fase 4 |
