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
| **v0.0** (VIGENTE) | [architecture-v0.0-baseline.md](architecture-v0.0-baseline.md) | baseline | `90b48ff` | 2026-11-17 | Estado ANTES da refatoração: editor BlenderPDS único (Spring Boot 4.1.1 + SPA React/three.js), CRDT no cliente, WebSocket sequenciado, sem Flyway e sem testes de frontend. |

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
| v0.1 | `architecture-v0.1-fase0-preparacao.md` | fim da Fase 0 |
| v0.2 | `architecture-v0.2-fase1-core-backend.md` | fim da Fase 1 |
| v0.3 | `architecture-v0.3-fase2-core-frontend.md` | fim da Fase 2 |
| v0.4 | `architecture-v0.4-fase3-seguranca-debitos.md` | fim da Fase 3 |
| v1.0 | `architecture-v1.0-fase4-aplicacoes.md` | fim da Fase 4 |
