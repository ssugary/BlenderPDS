---
version: "0.4"
phase: "fase 3 — segurança, débitos críticos e reidratação por snapshot"
commit_sha: "b80d5d5"
date: "2026-11-17"
previous_version: "architecture-v0.3-fase2-core-frontend.md"
corrections_after_snapshot: "2026-11-17 — nota de cabeçalho, corpo preservado: (a) o compose usa postgres:16, não 17; (b) sync_ops/sync_hello são isentos do rate limit (o corpo sugere orçamento uniforme), e o snapshot periódico do host passou a existir em 6d8955c, resolvendo a dívida 3 do §8; (c) contagens atuais: starter 169, app 10, app web 52, core 25."
scope: "Snapshot completo do repositório ao fim da Fase 3 (P2.fix, P3.0–P3.5 + gate). A identidade passa a vir sempre do usuário autenticado (principal + SecurityContext), operações e snapshots ganham validação completa e checksum, o WebSocket ganha rate limit e fan-out por SPI, a listagem de usuários vira busca, e a configuração/CI deixam de carregar segredos. Contratos REST/WS mudam em pontos explícitos e compatíveis por uma versão."
---

# 1. VISÃO GERAL

O produto continua sendo o **editor 3D colaborativo** em navegador, com o mesmo desenho
em três camadas da v0.3:

- **`framework/core`** (`@collab3d/core`) — CRDT genérico por registro de kinds, log de
  operações, protocolo por `MessageRegistry`, transporte WebSocket, presença, cena/render
  e `createCollabApp`. Continua sem nenhum kind de domínio.
- **`framework/react-kit`** (`@collab3d/react-kit`) — lobby, social, chat e toast.
- **`apps/design-editor/web`** (`blenderpds`) — somente o domínio do editor: kinds,
  projeção, ferramentas, comandos e telas específicas.

O backend também mantém a divisão da Fase 1: `framework/backend-starter` tem o framework
(API, segurança, WebSocket, sessão, persistência, snapshots) e `apps/design-editor/backend`
tem configuração e validadores de kind.

A Fase 3 não reescreveu a arquitetura; ela fechou os pontos em que o framework confiava no
cliente. Em uma frase: **identidade vem do `SecurityContext`, todo frame é validado e
limitado, e o snapshot é verificável**.

```yaml
stack:
  frontend:
    workspaces: "raiz: {private: true, workspaces: [\"apps/*/web\", \"framework/*\"]}"
    packages:
      - {name: "@collab3d/core", path: "framework/core", build: "vite build + tsc (ESM + d.ts)"}
      - {name: "@collab3d/react-kit", path: "framework/react-kit"}
      - {name: "blenderpds (app)", path: "apps/design-editor/web"}
    language: "TypeScript 7.0.2 (strict)"
    framework: "React 19.3.0"
    3d: "three 0.161.x"
    bundler: "Vite 8.3.x"
    test_runner: "Vitest 5.1.x"
  backend:
    language: "Java 21"
    framework: "Spring Boot 4.1.1 (Spring Framework 7, Security 7, Jackson 3)"
    build: "Maven (wrapper) — ./mvnw"
    persistence: "Spring Data JPA + Hibernate, PostgreSQL 17, Flyway V1–V3"
    websocket: "Spring WebSocket (TextWebSocketHandler) em /ws/sessions/{id}"
    modules:
      - {name: "backend-starter", path: "framework/backend-starter", role: "framework"}
      - {name: "design-editor-backend", path: "apps/design-editor/backend", role: "configuração + kinds"}
  infrastructure:
    compose: "Postgres 17 + Mailpit (compose.yaml, POSTGRES_PASSWORD obrigatória via .env)"
    ci: ".github/workflows/ci.yml (backend com Postgres/Mailpit; frontend build+test+gate)"
    gates: ["./mvnw test", "npm test", "npm run build", "npm run check-boundaries", "scripts/check-no-domain-kinds.sh"]
```

# 2. MAPA DE DIRETÓRIOS E ARQUITETURA

```text
.
├── compose.yaml                  # Postgres + Mailpit; senha vem de ${POSTGRES_PASSWORD}
├── .env.example                  # POSTGRES_PASSWORD (o .env real é ignorado pelo git)
├── .github/workflows/ci.yml       # backend (docker compose + ./mvnw verify) e frontend
├── contracts/design-editor/       # casos de contrato dos kinds (JUnit + Vitest)
├── docs/
│   ├── plano-framework-collab3d-completo.md
│   ├── ws-protocol.md             # protocolo v2 (sync_snapshot, RATE_LIMITED, detail, refs)
│   ├── CHANGELOG.md
│   ├── new-app-guide.md
│   └── architecture/              # snapshots imutáveis (este arquivo é a v0.4)
├── framework/
│   ├── backend-starter/
│   │   └── src/main/java/dev/collab3d/
│   │       ├── api/               # AuthController, SessionController, UserController, handlers
│   │       ├── autoconfigure/     # Collab3dProperties (collab3d.*), auto-configuração
│   │       ├── model/             # User, Session, Operation, Friendship, FriendRequest, Presence
│   │       ├── repository/        # Spring Data (UserRepository com busca paginada)
│   │       ├── security/          # AppUserDetails, SecurityActorResolver, Authz, SecurityConfig
│   │       ├── session/           # SessionServiceImpl, SnapshotPolicy, mensagens
│   │       ├── spi/               # OperationKind, SnapshotEnvelope, SnapshotChecksums,
│   │       │                      #   RateLimitPolicy, SessionBroadcaster, ActorResolver, ...
│   │       └── ws/                # SessionSocketHandler, registry, broadcaster, rate limit,
│   │                              #   WsFrames, SessionHandshakeInterceptor, handler/*
│   └── core/src/
│       ├── crdt/                  # LamportClock, OpLog, DocumentState (+ snapshot), replay
│       ├── sync/                  # SyncEngine, MessageRegistry, ReplicaSession
│       ├── api/, auth/, presence/, transport/, scene/, command/
│       └── index.ts
├── framework/react-kit/src/       # lobby, social, chat, toast
└── apps/design-editor/
    ├── backend/src/main/java/com/grupo03/blenderpds/kinds/  # SetMesh/AddObject/... validators
    ├── backend/src/main/resources/application.properties
    └── web/src/                   # kinds, collab (projeção), command, tool, format, telas
```

Dependências apontam para dentro: app → framework; o core não importa kinds de domínio (o
gate `check-no-domain-kinds.sh` verifica isso) e o backend-starter não conhece `com.grupo03`.

# 3. MODELO DE DADOS E ESTADO

## 3.1 Banco (Flyway)

| tabela | colunas relevantes | observação |
|---|---|---|
| `users` | id, nickname, email, password, email_verified, role | e-mail único; senha BCrypt |
| `sessions` | id, host_id, code, status, app_type, `snapshot`, `snapshot_seq`, `snapshot_version` | V2 acrescentou `app_type`; V3 acrescentou `snapshot_seq` e `snapshot_version` |
| `operations` | session_id, site_id, lamport, seq, author_id, kind, payload | `seq` é a ordem total do servidor; `(session_id, site_id, lamport)` deduplica |
| `friendships` | user_id, friend_id | amizade confirmada nos dois sentidos |
| `friend_requests`, `session_participants`, `presence` | — | presença tem `last_seen_at`, mas sem heartbeat (ver §8) |

O schema é propriedade do Flyway (`ddl-auto=validate`); `V1__baseline.sql` reproduz o que o
Hibernate criava, `V2` acrescenta `app_type` e `V3` os dois campos do snapshot.

## 3.2 Documento genérico (cliente)

`DocumentState` guarda registros por `siteId`:

```ts
interface RecordState {
  id: string;
  fields: Record<string, { value: unknown; stamp: Lamport }>
  addStamp: Lamport;
  removeStamp: Lamport | null;
  deleted: boolean;
}
```

Cada campo é LWW pelo carimbo; `deleted` é tombstones. `toSnapshot()` devolve os registros
**com carimbos** e tombstones, e `fromSnapshot()/restore()` os reinstala; sem os carimbos o
merge depois da reidratação divergiria.

## 3.3 Operações e kinds

Envelope: `{id:{lamport,siteId}, author, deps:[], kind, ...campos}`. O servidor normaliza
`author` para `id.siteId` (nunca confia no campo) e grava a autoria real em `author_id`.

Kinds do editor (nenhum outro):

| kind | campos | merge |
|---|---|---|
| `add_object` | objectId, geometry? (buffer serializado) | LWW por campo com `addStamp` |
| `set_transform` | objectId, position, rotation, scale | LWW por componente |
| `set_color` | objectId, color | LWW |
| `delete_object` | objectId | tombstone (`removeStamp`) |
| `set_mesh` | objectId, geometry (string JSON de `BufferGeometry`, ≤ `design.max-mesh-bytes`) | LWW da geometria |

`mesh_edit` e `undo` **não existem mais**: desfazer é compensatório, emitindo uma operação
normal pelo `Command.undo()`.

## 3.4 Snapshot de reidratação

```json
{
  "schemaVersion": 1,
  "appType": "design",
  "baseSeq": 5000,
  "versionVector": {"site-a": 5000},
  "state": {"schemaVersion": 1, "records": [...]},
  "checksum": "<sha256 do state canônico>"
}
```

`SnapshotChecksums` serializa o `state` com **chaves ordenadas** e calcula SHA-256; o
cliente faz o mesmo em `canonicalJson`. O servidor rejeita snapshot acima de
`collab3d.snapshot.max-bytes`, com `baseSeq` à frente do log ou retrocedendo, com checksum
inválido, ou de quem não é host. O log não é podado: o snapshot é materialização.

## 3.5 Presença

`session_participants` + `presence` (siteId, selectedObjectId, last_seen_at). A presença é
efêmera no protocolo e persistida só para o roster; sem heartbeat, um socket morto sem close
fica ativo (dívida registrada).

# 4. ENTRY POINTS E FLUXOS

## 4.1 Autenticação

1. `GET /auth/csrf` inicializa CSRF; `POST /auth/login` autentica e cria `JSESSIONID`
   (cookie HttpOnly).
2. O login devolve apenas `PublicUserDto` (id, nickname) — nunca e-mail de terceiros.
3. `SecurityConfig` protege `/api/**`, `/sessions/**`, `/users/**`; `@EnableMethodSecurity`
   habilita `@PreAuthorize`. Rotas de registro/confirmação/login são públicas.

## 4.2 Identidade nas requisições e no WebSocket

- `AppUserDetails` (principal) carrega o id; `SecurityActorResolver` lê o
  `SecurityContextHolder` e é o **único** caminho para saber "quem é o ator".
- `SessionController` e `UserController` usam `actorResolver.current()` e recusam ids
  alheios com 403 (`hostId`, `userId`, `{userId}` legados). Um id igual ao do ator é
  ignorado, não usado como fonte.
- No upgrade WS, `SessionHandshakeInterceptor` lê o `Principal` do handshake (cookie de
  sessão chega pelo proxy do Vite). `?userId=` é aceito só se coincidir; divergência → 403
  com WARN. Sala inexistente → 404, sem amizade → 403, cheia/encerrada → 409.

## 4.3 Sincronização

1. O cliente abre `/ws/sessions/{id}` e manda `sync_hello {vv}`.
2. Sem `vv` (réplica nova) e havendo snapshot: o servidor manda `sync_snapshot` e então
   somente operações com `seq > baseSeq`; a réplica faz `restoreSnapshot` e depois aplica
   as operações.
3. Com `vv`, o servidor manda as operações que faltam em páginas de até
   `collab3d.sync.chunk-size` (200) e no máximo `max-ops-per-message` (1000) por frame,
   respeitando o teto de 7000 bytes (`FrameBatcher` divide por bytes, não por contagem).
4. Cada `sync_ops` enviado pelo cliente é validado (envelope + kind registrado), recebe
   `seq`, é persistido com `author_id` do ator e retransmitido como `sync_ops`; o remetente
   recebe `sync_ack`.
5. Um frame acima do orçamento (`RateLimitPolicy`, 50/s por conexão e tipo) é descartado
   com `error{RATE_LIMITED}` e a conexão continua.
6. O fan-out passa por `SessionBroadcaster` (padrão em memória). `SessionConnectionRegistry`
   continua dono do mapa de conexões.

## 4.4 Edição e importação

Ferramentas emitem comandos que geram operações locais e as aplicam otimisticamente no
`DocumentState`; o `SyncEngine` envia e o servidor ordena. A importação `.obj` lê a
geometria (`ObjImporter.readModel`) e emite `add_object` com o buffer serializado; o
`SceneProjector` reconstrói `BufferGeometry` a partir da operação, então duas réplicas
convergem. `set_mesh` faz o mesmo para edições de malha, com teto de 256 KiB.

## 4.5 Snapshot

O host pode enviar `scene_snapshot {snapshot}` (ou gravar pelo serviço REST interno); o
servidor valida envelope, política, `baseSeq` e checksum, e persiste em `sessions.snapshot`
com `snapshot_seq`/`snapshot_version`. Um snapshot corrompido é recusado com
`SNAPSHOT_REJECTED` sem alterar o anterior.

## 4.6 Presença e chat

`presence` e `chat` são efêmeros e retransmitidos pelo broadcaster; chat tem teto de 500
caracteres. O roster é enviado a cada entrada/saída/estado.

# 5. DEPENDÊNCIAS EXTERNAS E INTEGRAÇÕES

- **PostgreSQL 17** (compose) — banco único do monorepo; testes usam
  `spring.docker.compose.file` e a senha vem do `.env`.
- **Mailpit** (compose) — SMTP local; produção usa `MAIL_*`.
- **Spring Security** — sessão por cookie, CSRF, BCrypt; OAuth2 foi removido do backend.
- **Jackson 3** (`tools.jackson`) para o protocolo; as anotações continuam em
  `com.fasterxml.jackson.annotation` e são dependência explícita no `pom.xml`.
- **three.js** — render e geometria no cliente; o core não depende de React.
- **GitHub Actions** — `.github/workflows/ci.yml` (sem credenciais embutidas).

# 6. COMANDOS OPERACIONAIS

```bash
cp .env.example .env          # defina POSTGRES_PASSWORD
docker compose up -d --wait   # Postgres + Mailpit
./mvnw test                   # backend (starter + app)
npm test                      # todos os workspaces
npm run build                 # build de todos os workspaces
npm run check-boundaries
bash scripts/check-no-domain-kinds.sh
cd apps/design-editor/web && npm run dev   # Vite em 5173
```

# 7. RESTRIÇÕES E FRONTEIRAS

- O core não conhece kinds de domínio; o backend-starter não conhece o app.
- Identidade nunca vem de payload/query (exceto o legado coincidente, ignorado).
- `author` de operação é dado derivado, não confiável.
- Todo frame tem teto de bytes e de taxa; snapshots têm teto e checksum.
- O servidor é single-instance para fan-out (`SessionBroadcaster` em memória).
- O log é a fonte de verdade; snapshot é reidratação e não substitui operações.

# 8. STATUS E DÍVIDA TÉCNICA

Testes ao fim da fase: **166 no starter + 10 no app** (backend), **52 no app web + 22 no
core** (frontend), todos verdes, mais os cinco gates.

Dívidas em aberto (registradas em `docs/refactor-notes.md` §16):

1. **TTL de presença sem heartbeat** — socket morto sem close fica `active=true` até uma
   reconexão; Fase 4 deve adicionar ping/TTL.
2. **Broadcaster em memória** — uma segunda instância não vê as conexões da primeira;
   broker fica para depois.
3. **Cliente não envia snapshot periodicamente** — o caminho de leitura está pronto e
   testado, mas nenhum timer o alimenta.
4. **`SnapshotCodec.migrate` não é chamado na leitura** — snapshots antigos só serão
   migrados quando houver mudança de formato.
5. **Gate visual WebGL** continua manual; não há Playwright no projeto.

Dívidas resolvidas nesta fase: spoofing de identidade, listagem de todos os usuários,
`mesh_edit`/`undo` como tipos, frame sem teto em bytes, snapshot sem envelope/checksum,
senha literal no compose, ausência de CI, fan-out acoplado ao registry e rate limit
inexistente.

# 9. DELTA EM RELAÇÃO À VERSÃO ANTERIOR

## 9.1 Contratos aditivos

- **WS `sync_snapshot`**: novo frame servidor→cliente, enviado antes do catch-up por
  operações quando a réplica chega sem versão vetorial e há snapshot. Um cliente v0.3 o
  ignora (tipo desconhecido) e continua recebendo as operações; por isso é aditivo.
- **WS `error.detail`**: campo opcional, ≤200 caracteres, sem stack trace. Clientes antigos
  ignoram.
- **WS `error{RATE_LIMITED}`**: novo código; antes o frame era processado.
- **REST `GET /sessions/open/me` e `GET /sessions/friends`**: atalhos sem id na URL.
- **REST `GET /users/search?nickname=&page=&size=`**: busca paginada, mínimo 3 caracteres,
  no máximo 20 por página, resposta só com id/nickname.
- **Kind `set_mesh`** e campo opcional `geometry` em `add_object`.
- **Colunas** `sessions.snapshot_seq` e `sessions.snapshot_version` (V3), compatíveis com
  linhas antigas (NULL).
- **SPIs** `RateLimitPolicy` e `SessionBroadcaster`, com implementações padrão.

## 9.2 Contratos de quebra

- **Identidade**: `hostId` (criar), `userId` (join/leave/end) e `?userId=` (WS) não são mais
  fonte de identidade. Coincidir → ignorado; divergir → 403 + WARN. Clientes v0.3 que
  mandavam o próprio id continuam funcionando; os que mandavam id alheio passam a receber
  403 (era exatamente o ataque).
- **`GET /users`**: a listagem completa foi removida (405). Quem precisar de busca usa
  `/users/search`; a resposta não traz e-mail.
- **`scene_snapshot`**: só aceita o envelope completo; o formato provisório é recusado.
- **`mesh_edit`/`undo`**: tipos removidos do catálogo; clientes que os enviarem recebem
  `INVALID_OP` (o frame é descartado, a conexão continua). Undo vira compensação.
- **`author`**: o servidor sobrescreve com o site do remetente; quem lia o campo para
  atribuir autoria deve usar `author_id`/o autor do frame.
- **`compose.yaml`**: exige `POSTGRES_PASSWORD`; sem `.env` (ou variável exportada) o
  Compose recusa subir. É intencional.
- **Perfil/lista de amigos de terceiros**: sem e-mail.

## 9.3 Removido

- Classes e campos mortos: `AddObjectCommand` antigo, `deleteBySessionIdAndUserId`,
  dependências OAuth2 do backend, `.d.ts` obsoletos, `mesh_edit`/`undo` no core e no app.
- Senha literal do compose e a possibilidade de listar todos os usuários.

## 9.4 Alterado internamente (contrato preservado)

- `FrameBatcher` limita por bytes; `SyncHelloHandler` pagina e envia snapshot.
- `SessionServiceImpl.saveSnapshot` concentra política + teto + monotonicidade + checksum.
- `SessionSocketHandler` consulta `RateLimitPolicy` antes do handler e usa
  `SessionBroadcaster` no fan-out; libera os buckets no close.
- `WsFrames.error` ganhou overload com `detail`.
- `UserRepository` ganhou busca paginada por nickname.

## 9.5 Evidência dos gates

```
./mvnw test           BUILD SUCCESS — starter 166, app 10
npm test              app web 52, core 22
npm run build         ok
npm run check-boundaries  ok
check-no-domain-kinds.sh  ok
```

## 9.6 Dívidas técnicas novas

Ver §8: TTL de presença/heartbeat, broadcaster single-instance, envio periódico de snapshot,
migração de snapshot não chamada e gate visual manual.

## 9.7 O que esta versão NÃO altera

REST de autenticação (rotas e payloads), formato das operações existentes
(`add_object`/`set_transform`/`set_color`/`delete_object`), roster/presença/chat, schema das
tabelas exceto as duas colunas da V3, e a separação de pacotes da v0.3.
