# Changelog do collab3d

O formato segue uma versão por fase do plano (`docs/plano-framework-collab3d-completo.md`).
Cada fase é um marco funcional; mudanças de contrato estão marcadas como **aditivas** ou
**de quebra**.

## Fase 3 — segurança e débitos críticos

### Aditivo

- `sync_snapshot` no protocolo WebSocket: o servidor manda o snapshot armazenado antes
  das operações posteriores quando a réplica chega sem versão vetorial.
- `detail` opcional no frame `error` (≤200 caracteres, sem stack trace).
- `/sessions/open/me` e `/sessions/friends` (as rotas com `{userId}` continuam por uma
  versão, exigindo que o id seja o do ator).
- `GET /users/search?nickname=&page=&size=`: busca paginada por nickname (mínimo 3
  caracteres), retornando apenas id e nickname.
- Kind `set_mesh` no editor (LWW do buffer de geometria, limitado por
  `design.max-mesh-bytes`), com casos de contrato compartilhados no cliente e no servidor.
- `SnapshotEnvelope` com `schemaVersion`, `baseSeq`, `versionVector` e `checksum`.
- `RateLimitPolicy` (SPI) e `SessionBroadcaster` (SPI) com implementações em memória.
- `DocumentState.toSnapshot()/fromSnapshot()` e `OpLog.seedFromSnapshot()` no core.
- `error{RATE_LIMITED}` para o frame acima do orçamento por conexão/tipo.

### De quebra

- `hostId` (criar sala), `userId` (join/leave/end) e `?userId=` (WebSocket) deixam de
  ser fonte de identidade. Valores divergentes do usuário autenticado recebem `403`;
  valores coincidentes são ignorados. Clientes novos não enviam mais esses campos.
- `GET /users` deixa de listar todos os usuários (`405`); a busca é o único caminho.
- Perfis e listas de amigos de terceiros não incluem mais e-mail.
- `author` de uma operação é normalizado pelo servidor para o `siteId` do remetente;
  a autoria persistida passa a ser o ator autenticado.
- `scene_snapshot` só aceita o envelope completo; o formato provisório
  `{appType, baseSeq, state}` não é mais armazenado.
- `mesh_edit` e `undo` deixam de existir como tipos de operação; undo é compensatório
  (`Command.undo()` emite `set_transform`/`add_object`/`set_mesh`).

## Fase 2 — extração do core e frontend

- `framework/core` sem kinds de domínio, com registro de operações e mensagens.
- `framework/react-kit` com `createCollabApp`, telas de lobby e presença.
- Contratos de kinds compartilhados (`contracts/design-editor/*.cases.json`).
- Editor colaborativo ponta a ponta, incluindo reconexão e `.obj` local.

## Fase 1 — backend como framework

- `framework/backend-starter` com SPI de sessão, operações, snapshots, políticas de
  entrada e mensagens WebSocket.
- Migrações Flyway V1/V2, Postgres/Mailpit no `compose.yaml`.
- Backend do editor reduzido a configuração + kinds do domínio.

## Fase 0 — linha de base

- Monorepo npm + Maven, scripts de build/teste e verificação de fronteiras.
