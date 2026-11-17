---
version: "0.2"
phase: "fase 1 — extração do core backend, despachante de mensagens e parametrização de validação/payloads"
commit_sha: "13e6686"
date: "2026-11-17"
previous_version: "architecture-v0.1-fase0-preparacao.md"
scope: "Snapshot completo do repositório ao fim da Fase 1 (P1.1–P1.12). O backend virou um monorepo Maven com framework/backend-starter (dev.collab3d) e apps/design-editor/backend; o SessionSocketHandler virou despachante sobre um MessageCatalog; a validação de operação ficou genérica (envelope + OperationKindRegistry, com os 4 kinds do editor na aplicação); o sequenciador, a admissão por políticas, o estado reduzido, as cadeias de entrada/visibilidade, sessions.app_type (V2) e o catch-up paginado entraram. REST, WebSocket e schema de operações continuam compatíveis com o frontend inalterado; o banco ganhou apenas a coluna aditiva app_type."
---

# 1. VISÃO GERAL

O produto continua sendo o **editor 3D colaborativo** em navegador (React + three.js contra Spring
Boot/PostgreSQL), mas o backend deixou de ser uma aplicação única: ele agora é um **framework**
(`framework/backend-starter`, artefato `dev.collab3d:collab3d-spring-boot-starter`) mais a **primeira
aplicação** construída sobre ele (`apps/design-editor/backend`, `com.grupo03:design-editor-backend`).

A separação é de responsabilidade, não de contrato: o framework é dono dos **frozen-spots** (usuários,
amizades, salas, sequenciador do log, handshake/relay/roster/acks do WebSocket, persistência) e expõe
**hot-spots** por interfaces no pacote `dev.collab3d.spi`, com implementações default substituíveis por
bean. A aplicação registra o que é do domínio — hoje, os quatro `kind`s de operação do editor.

```yaml
stack:
  backend:
    language: "Java 21"
    evidence: "pom.xml:29-31"
    framework: "Spring Boot 4.1.1 (parent)"
    evidence: "pom.xml:5-9"
    build: "Maven multi-módulo (parent dev.collab3d:collab3d-parent, packaging pom)"
    evidence: "pom.xml:14-25"
    modules:
      - {name: "framework/backend-starter", artifact: "dev.collab3d:collab3d-spring-boot-starter", evidence: "framework/backend-starter/pom.xml:10-17"}
      - {name: "apps/design-editor/backend", artifact: "com.grupo03:design-editor-backend", evidence: "apps/design-editor/backend/pom.xml:10-17"}
    json: "Jackson 3 — tools.jackson.core:jackson-databind:3.1.5"
    json_evidence: "framework/backend-starter/src/main/java/dev/collab3d/ws/OperationValidator.java:27-28"
    json_annotations: "com.fasterxml.jackson.annotation (jackson-annotations 2.21, transitivo)"
    migrations: "Flyway — spring-boot-starter-flyway + flyway-database-postgresql"
    migrations_evidence: "framework/backend-starter/pom.xml:62-72"
    modules_spring:
      - {name: "spring-boot-starter-webmvc", evidence: "framework/backend-starter/pom.xml:45"}
      - {name: "spring-boot-starter-data-jpa", evidence: "framework/backend-starter/pom.xml:29"}
      - {name: "spring-boot-starter-security", evidence: "framework/backend-starter/pom.xml:33"}
      - {name: "spring-boot-starter-security-oauth2-client", evidence: "framework/backend-starter/pom.xml:37", used: false}
      - {name: "spring-boot-starter-validation", evidence: "framework/backend-starter/pom.xml:41"}
      - {name: "spring-boot-starter-websocket", evidence: "framework/backend-starter/pom.xml:49"}
      - {name: "spring-boot-starter-mail", evidence: "framework/backend-starter/pom.xml:53"}
      - {name: "spring-boot-starter-flyway", evidence: "framework/backend-starter/pom.xml:65"}
      - {name: "flyway-database-postgresql", evidence: "framework/backend-starter/pom.xml:69", scope: "runtime"}
      - {name: "lombok", evidence: "framework/backend-starter/pom.xml:88-91"}
      - {name: "com.tngtech.archunit:archunit:1.4.1", evidence: "framework/backend-starter/pom.xml:128-132", scope: "test"}
      - {name: "spring-boot-docker-compose", evidence: "framework/backend-starter/pom.xml:80-84", scope: "runtime", also_in_app: "apps/design-editor/backend/pom.xml:26-31"}
  frontend:
    location: "apps/design-editor/web (workspace npm `blenderpds`)"
    state: "inalterado na Fase 1"
    language: "TypeScript 7.0.2 (strict)"
    framework: "React 19.3.0"
    3d: "three 0.161.x"
    bundler: "Vite 8.3.x + @vitejs/plugin-react"
    test_runner: "Vitest 5.1.x — 29 testes em 4 arquivos"
    workspaces: "raiz: {\"private\": true, \"workspaces\": [\"apps/*/web\"]}"
  data:
    engine: "PostgreSQL 16"
    evidence: "compose.yaml (raiz)"
    orm: "Spring Data JPA / Hibernate (ddl-auto=validate)"
  mail:
    dev: "Mailpit (SMTP 1025, UI 8025)"
    evidence: "compose.yaml"
```

# 2. MAPA DE DIRETÓRIOS E ARQUITETURA

```yaml
directories:
  - path: "."
    responsibility: "Raiz do monorepo: pom.xml (parent Maven), package.json (npm workspaces), compose.yaml, mvnw, scripts/"
  - path: "framework/backend-starter"
    responsibility: "Framework: tudo o que uma aplicação 3D colaborativa reutiliza (usuários, amizades, salas, log, WebSocket, SPI)"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/autoconfigure"
    responsibility: "Collab3dAutoConfiguration (@AutoConfiguration, @ComponentScan dev.collab3d, @EntityScan, @EnableJpaRepositories, defaults dos hot-spots), Collab3dProperties, JpaAuditingConfig"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/spi"
    responsibility: "Hot-spots HS1/HS2/HS3/HS5/HS6: OperationAdmissionPolicy, SessionStateReducer, SessionStateView, SnapshotPolicy, MessageTypeHandler, AbstractMessageTypeHandler, MessageValidator, OperationKindValidator, SessionJoinPolicy, SessionCapacityPolicy, SessionVisibilityPolicy, SessionOperationAppender, Broadcaster, SessionLifecycleListener, SessionContext, Actor, AppendResult/RejectedOperation, OperationFields e exceções do protocolo"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/spi/defaults"
    responsibility: "Implementações default: AdmitAllPolicy, HostFriendJoinPolicy, FixedCapacityPolicy, AlwaysVisiblePolicy, HostOnlySnapshotPolicy"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/ws"
    responsibility: "Despachante (SessionSocketHandler), MessageCatalog, WsFrames, ProtocolLimits, OperationValidator (envelope), OperationKindRegistry, conexões/lock (SessionConnection, SessionConnectionRegistry), handshake (SessionHandshakeInterceptor), WebSocketConfig, adaptadores Broadcaster/SessionOperationAppender por conexão"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/ws/handler"
    responsibility: "Handlers dos tipos atuais: SyncHelloHandler, SyncOpsHandler, SnapshotHandler, PresenceRelayHandler, ChatRelayHandler"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/sequencer"
    responsibility: "OperationSequencer (lock, seq, dedupe) e OperationAppender (validação de lote, cadeia de admissão, estado reduzido, persistência)"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/session"
    responsibility: "Ciclo de sala: SessionService/Impl, SessionContextFactory, SessionStateStore, eventos (SessionCreatedEvent, ParticipantJoinedEvent, ParticipantLeftEvent, SessionEndedEvent) e SessionLifecycleDispatcher"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/api"
    responsibility: "Adaptadores REST: AuthController, UserController, SessionController, ApiExceptionHandler"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/user"
    responsibility: "Casos de uso de conta e amizade: AuthService/Impl, UserService/Impl"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/security"
    responsibility: "SecurityConfig (CSRF, sessão HTTP, rotas públicas) e UserDetailsService/Impl"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/model"
    responsibility: "Entidades JPA: User, FriendRequest, Session (com app_type), SessionParticipant, SessionOperation, EmailConfirmationToken; enums Role, SessionStatus"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/repository"
    responsibility: "Spring Data JPA, incluindo findByIdForUpdate e a página do catch-up (findBySessionIdAndSeqGreaterThanOrderBySeq)"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/dto"
    responsibility: "Contratos JSON do REST (SessionCreateDto agora aceita appType opcional, ignorado)"
  - path: "framework/backend-starter/src/main/java/dev/collab3d/mail"
    responsibility: "EmailService/Impl (JavaMailSender)"
  - path: "framework/backend-starter/src/main/resources"
    responsibility: "META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports e db/migration (V1__baseline.sql, V2__session_app_type.sql)"
  - path: "framework/backend-starter/src/test/java"
    responsibility: "149 testes: API, serviços, repositórios, mapeamento, WebSocket (caracterização + concorrência + admissão + catch-up 10k), políticas, layout ArchUnit"
  - path: "apps/design-editor/backend"
    responsibility: "Aplicação 1: BlenderpdsApplication + pacote kinds (4 OperationKindValidator) + application.properties; 6 testes (contexto e kinds)"
  - path: "apps/design-editor/web"
    responsibility: "SPA do editor — INALTERADO na Fase 1 (REST/WS/schema de operações preservados)"
  - path: "scripts/check-no-domain-kinds.sh"
    responsibility: "Gate: falha se framework/ contiver literal de kind de domínio (add_object etc.)"
  - path: "docs/architecture"
    responsibility: "Histórico imutável: v0.0-baseline, v0.1-fase0, v0.2-fase1, legacy/ e índice README.md"
  - path: "docs"
    responsibility: "refactor-notes.md (premissas e decisões das fases) e plano-framework-collab3d-completo.md"
```

Padrões usados no framework (todos em `dev.collab3d`):

```yaml
patterns:
  - {pattern: "Registry + Factory", where: "MessageCatalog (ws), OperationKindRegistry (ws)", why: "chave -> handler/validador sem switch; duplicidade falha no boot"}
  - {pattern: "Strategy", where: "OperationAdmissionPolicy, SessionJoinPolicy, SessionCapacityPolicy, SessionVisibilityPolicy, SnapshotPolicy", why: "algoritmo trocável por bean da aplicação"}
  - {pattern: "Chain of Responsibility", where: "List<OperationAdmissionPolicy>, List<SessionJoinPolicy> (+capacidade/visibilidade)", why: "primeira negação vence; várias regras compostas"}
  - {pattern: "Template Method", where: "AbstractMessageTypeHandler.handle = validate -> authorize -> execute", why: "o handler não consegue pular etapa"}
  - {pattern: "Observer", where: "SessionLifecycleListener + SessionLifecycleDispatcher (AFTER_COMMIT)", why: "reagir ao ciclo da sala sem acoplar o serviço"}
  - {pattern: "Dependency Injection / ConditionalOnMissingBean", where: "Collab3dAutoConfiguration", why: "default substituível sem tocar o framework"}
  - {pattern: "Dispatcher", where: "SessionSocketHandler", why: "tipo de frame não edita o despachante"}
```

Padrão do frontend permanece **Composition Root + Managers/Controllers/Tools/Commands + EventBus +
CRDT client-side** (`apps/design-editor/web/src/core/Engine.ts`, `.../core/controllers/ActionRouter.ts`,
`.../collab/DocumentState.ts`) — nada nele mudou nesta fase.

# 3. MODELO DE DADOS E ESTADO

```yaml
database:
  engine: "PostgreSQL 16"
  schema_management: "Flyway (baseline-on-migrate=true) + Hibernate ddl-auto=validate"
  evidence: "framework/backend-starter/src/main/resources/application.properties:8-14, apps/design-editor/backend/src/main/resources/application.properties:10-14"
  migrations:
    - {file: "framework/backend-starter/src/main/resources/db/migration/V1__baseline.sql", content: "baseline do schema (pg_dump --schema-only)"}
    - {file: "framework/backend-starter/src/main/resources/db/migration/V2__session_app_type.sql", content: "ALTER TABLE sessions ADD COLUMN app_type varchar(32) NOT NULL DEFAULT 'design'"}
  verified: "log de boot: 'Successfully applied 1 migration to schema \"public\", now at version v2' na base de dev/teste que já existia (P1.10)"

tables:
  users: "id, nickname varchar(50), email varchar(100) unique, password_hash, role + CHECK, email_verified, created_at; friendList @ManyToMany via user_friends"
  friend_requests: "id, sender_id, receiver_id, created_at; uk_friend_request_pair"
  sessions:
    columns:
      id: "IDENTITY"
      user_id: "FK users (host; nome legado mantido)"
      status: "varchar(20) + CHECK (WAITING|ACTIVE|ENDED)"
      code: "varchar(12) unique"
      app_type: "varchar(32) NOT NULL DEFAULT 'design' (V2) — aplicação dona da sala"
      scene_snapshot: "text (JSON opaco, denormalização)"
      created_at: "timestamptz"
      updated_at: "timestamptz"
      ended_at: "timestamptz nullable"
    entity_evidence: "framework/backend-starter/src/main/java/dev/collab3d/model/Session.java:60-66"
  session_participants: "id, session_id, user_id, active, joined_at, last_seen_at; uk_session_participant (session_id, user_id)"
  session_operations:
    columns: "id, session_id, seq, site_id varchar(100), lamport, author_id (nullable), kind varchar(32), payload text (envelope JSON completo), created_at"
    constraints: ["uk_session_operation_seq (session_id, seq)", "uk_session_operation_op (session_id, site_id, lamport)"]
    indexes_support: "uk_session_operation_seq cobre a página do catch-up (session_id, seq > ?)"
  email_confirm_tokens: "id, token varchar(64) unique, user_id, expires_at (TTL 24h)"

enums:
  Role: "USER | ADMIN"
  SessionStatus: "WAITING | ACTIVE | ENDED"

server_side_state:
  - {name: "SessionConnectionRegistry", role: "conexões abertas + lock por sessão (runLocked)", evidence: "framework/backend-starter/src/main/java/dev/collab3d/ws/SessionConnectionRegistry.java:22-29", scope: "memória do processo"}
  - {name: "SessionStateStore", role: "estado reduzido opcional por sala (SessionStateReducer), reconstruído do log e avançado por op aceita", evidence: "framework/backend-starter/src/main/java/dev/collab3d/session/SessionStateStore.java:57-67", default: "vazio (nenhuma app declara reducer hoje)"}
  - {name: "SessionConnection queue", role: "frames enfileirados durante o catch-up até finishCatchUp", evidence: "framework/backend-starter/src/main/java/dev/collab3d/ws/SessionConnection.java"}

frontend_state:
  - {piece: "ReplicaSession / OpLog / DocumentState / LWWRegister / SceneProjector / PresenceService", state: "inalterados"}
  - {piece: "localStorage blenderpds:user", state: "inalterado"}
```

# 4. ENTRY POINTS E FLUXOS

```yaml
entry_points:
  backend_app:
    file: "apps/design-editor/backend/src/main/java/com/grupo03/blenderpds/BlenderpdsApplication.java"
    annotation: "@SpringBootApplication (scan do pacote com.grupo03.blenderpds: kinds)"
    port: "8080 (README)"
  backend_framework:
    file: "framework/backend-starter/src/main/java/dev/collab3d/autoconfigure/Collab3dAutoConfiguration.java"
    annotation: "@AutoConfiguration + @ComponentScan(dev.collab3d) + @EntityScan + @EnableJpaRepositories"
    registration: "framework/backend-starter/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports"
  backend_websocket:
    path: "/ws/sessions/*"
    evidence: "framework/backend-starter/src/main/java/dev/collab3d/ws/WebSocketConfig.java:36"
    handshake: "SessionHandshakeInterceptor.beforeHandshake -> SessionService.connectParticipant"
    dispatcher: "SessionSocketHandler.handleTextMessage -> MessageCatalog.find(type)"
  frontend:
    html: "apps/design-editor/web/index.html"
    routes: "apps/design-editor/web/src/react/ui/AppRoutes.tsx"
```

Rotas REST — **inalteradas** (mesmos verbos, caminhos e status); agora servidas pelo módulo starter:

```yaml
rest_routes:
  auth: ["GET /auth/csrf (público)", "POST /auth/login (público)", "POST /auth/logout"]
  users: ["POST /users (público)", "GET /users", "GET /users/{id}", "PUT /users/{id}", "DELETE /users/{id}", "GET /users/confirm-email (público)", "POST /users/{id}/confirm-email", "POST|GET /users/{id}/friend-requests", "GET /users/{id}/friend-requests/sent", "POST /users/{id}/friend-requests/{requestId}/accept|reject", "DELETE /users/{id}/friend-requests/{requestId}", "GET /users/{id}/friends", "DELETE /users/{id}/friends/{friendId}"]
  sessions: ["POST /sessions", "GET /sessions/{id}", "GET /sessions/code/{code}", "GET /sessions/open/{userId}", "GET /sessions/{id}/participants", "POST /sessions/{id}/join", "POST /sessions/{id}/leave", "POST /sessions/{id}/end", "GET /sessions/friends/{userId}", "GET /sessions/{id}/state"]
  evidence: "framework/backend-starter/src/main/java/dev/collab3d/api/{Auth,User,Session}Controller.java"
  note: "frontend chama /api/<path>; o proxy do Vite remove o prefixo"
```

Protocolo WebSocket — **inalterado**; o que mudou é quem trata cada tipo:

```yaml
ws_protocol:
  url: "ws(s)://<host>/ws/sessions/{sessionId}?userId={userId}"
  client_to_server:
    - {type: "sync_hello", handler: "dev.collab3d.ws.handler.SyncHelloHandler", delivery: "UNICAST_REPLY"}
    - {type: "sync_ops", handler: "dev.collab3d.ws.handler.SyncOpsHandler", delivery: "PERSISTED_OPS (sob lock)"}
    - {type: "presence", handler: "dev.collab3d.ws.handler.PresenceRelayHandler", delivery: "RELAY_EPHEMERAL"}
    - {type: "chat", handler: "dev.collab3d.ws.handler.ChatRelayHandler", delivery: "RELAY_EPHEMERAL"}
    - {type: "scene_snapshot", handler: "dev.collab3d.ws.handler.SnapshotHandler", delivery: "UNICAST_REPLY"}
  server_to_client: ["sync_ops", "sync_ack {siteId,lamport,seq}", "session_roster {sessionId,status,participants[]}", "presence (relay)", "chat (relay)", "error {code}"]
  error_codes: ["UNKNOWN_TYPE", "INVALID_MESSAGE", "INTERNAL_ERROR", "INVALID_OP", "OP_REJECTED", "SYNC_FAILED", "INVALID_SNAPSHOT", "SNAPSHOT_TOO_LARGE", "SNAPSHOT_REJECTED"]
  unknown_type: "MessageCatalog.find(vazio) -> error{UNKNOWN_TYPE}"
  duplicate_type_or_kind: "falha no boot (MessageCatalog / OperationKindRegistry)"
  ordering_guarantee: "frames PERSISTED_OPS rodam em SessionConnectionRegistry.runLocked"
  roster_delay: "a conexão nasce em catchingUp; o roster inicial só sai depois do primeiro sync_hello"
  frame_size_ceiling: "~8 KB por frame de texto (buffer padrão do Tomcat, nada configura)"
  characterisation_tests: "SessionWebSocketTest (9 testes, asserts do P0.2 inalterados)"
  new_protocol_behaviour: "rejeição de admissão por operação emite error{code} e não persiste (P1.8)"
```

Envelope de operação (verificado em P0.1 e preservado):

```
{ id: {siteId, lamport}, author, deps: [], kind, ...campos-do-kind }
```

`author` deve ser igual a `id.siteId`, `deps` deve estar vazio; o servidor persiste o **envelope
inteiro** em `session_operations.payload` e anexa `seq` ao retransmitir. O que mudou é que o
significado de cada campo do `kind` é responsabilidade de um `OperationKindValidator` registrado pela
aplicação: kind sem validador → `INVALID_OP` (secure by default).

```yaml
flows:
  - {step: "frame chega", from: "WebSocket", to: "SessionSocketHandler.handleTextMessage", via: "parse do envelope {type, ...}"}
  - {step: "despacho", from: "SessionSocketHandler", to: "MessageCatalog.find(type)", then: "handler.handle(ctx, root)"}
  - {step: "lock", from: "SessionSocketHandler", to: "SessionConnectionRegistry.runLocked", when: "Delivery.PERSISTED_OPS"}
  - {step: "validação", from: "SyncOpsHandler", to: "OperationAppender.append", then: "OperationValidator.validateBatch (envelope) + OperationKindRegistry (payload)"}
  - {step: "admissão", from: "OperationAppender", to: "List<OperationAdmissionPolicy>.admit", then: "SessionStateStore.view(ctx)"}
  - {step: "sequência", from: "OperationAppender", to: "OperationSequencer.append", then: "SELECT ... FOR UPDATE, MAX(seq)+1, dedupe (site_id, lamport), INSERT"}
  - {step: "estado reduzido", from: "OperationAppender", to: "SessionStateStore.advance", when: "aceita"}
  - {step: "entrega", from: "SyncOpsHandler", to: "ConnectionBroadcaster", then: "sync_ops (broadcastExcept) + sync_ack (reply); rejeitadas -> error{code}"}
  - {step: "catch-up", from: "SyncHelloHandler", to: "SessionService.syncSinceSeq(sessionId, cursor, chunkSize)", then: "filtra vv da página e envia um sync_ops por página"}
  - {step: "ciclo da sala", from: "SessionServiceImpl", to: "SessionLifecycleDispatcher", via: "SessionCreatedEvent/ParticipantJoinedEvent/ParticipantLeftEvent/SessionEndedEvent (@TransactionalEventListener AFTER_COMMIT)"}
  - {step: "fim da sala", from: "SessionEndedEvent", to: "SessionSocketHandler.onSessionEnded", then: "registry.closeAll + stateStore.evict"}
```

# 5. DEPENDÊNCIAS EXTERNAS E INTEGRAÇÕES

```yaml
maven:
  parent: "org.springframework.boot:spring-boot-starter-parent:4.1.1"
  modules: ["framework/backend-starter", "apps/design-editor/backend"]
  app_dependency: "dev.collab3d:collab3d-spring-boot-starter:${project.version} + spring-boot-docker-compose (runtime, opcional)"
  test_libraries: ["archunit 1.4.1", "spring-boot-starter-*-test (webmvc, websocket, data-jpa, security, validation, actuator)"]
npm:
  root: "collab3d (private, workspaces apps/*/web)"
  workspace: "blenderpds"
  versions: "react 19.3, react-router-dom 7.18, three 0.161, typescript 7.0.2, vite 8.3, vitest 5.1"
integrations:
  - {name: "PostgreSQL 16", type: "database", config: "compose.yaml (raiz), volume persistente, via spring-boot-docker-compose"}
  - {name: "Flyway", type: "migração", config: "db/migration no starter; baseline-on-migrate=true"}
  - {name: "Mailpit", type: "email", config: "compose.yaml (SMTP 1025/UI 8025); JavaMailSender"}
  - {name: "Vite proxy", type: "http/ws", config: "'/api' rewrite e '/ws' com ws:true; o cookie JSESSIONID chega intacto (P0.1 §3.4)"}
  - {name: "third-party SDKs", type: "absent", note: "nenhum cliente externo em pom.xml ou package.json"}
  - {name: "broker/fila", type: "absent", note: "relay em memória: backend single-instance"}
env_vars:
  backend: ["MAIL_HOST", "MAIL_PORT", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_SMTP_AUTH", "MAIL_SMTP_STARTTLS", "MAIL_FROM", "APP_BASE_URL", "WS_ALLOWED_ORIGINS (fallback de collab3d.ws.allowed-origins)", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"]
  frontend: ["BACKEND_URL (default http://localhost:8080)"]
  spring_injected: ["SPRING_DATASOURCE_* via docker-compose"]
framework_properties:
  prefix: "collab3d"
  keys:
    - {key: "collab3d.app-type", default: "design", evidence: "Collab3dProperties.java:22", used_by: "SessionServiceImpl.createSession; SessionContextFactory (fallback)"}
    - {key: "collab3d.session.max-participants", default: 4, evidence: "Collab3dProperties.java:30"}
    - {key: "collab3d.sync.chunk-size", default: 200, evidence: "Collab3dProperties.java:34-37"}
    - {key: "collab3d.sync.max-ops-per-message", default: 1000, evidence: "Collab3dProperties.java:34-37"}
    - {key: "collab3d.sync.max-version-entries", default: 100, evidence: "Collab3dProperties.java:34-37"}
    - {key: "collab3d.snapshot.max-bytes", default: 1000000, evidence: "Collab3dProperties.java:41"}
    - {key: "collab3d.ws.allowed-origins", default: "lista vazia", evidence: "Collab3dProperties.java:48"}
    - {key: "collab3d.ws.max-chat-length", default: 500, evidence: "Collab3dProperties.java:48"}
    - {key: "collab3d.rate-limit.default-per-second / per-type", default: "50 / vazio", evidence: "Collab3dProperties.java:53", applied: false}
```

# 6. COMANDOS OPERACIONAIS

```yaml
commands:
  install:
    backend: "sem passo explícito (Maven Wrapper resolve no primeiro build)"
    frontend: "npm install   # na raiz: instala todos os workspaces"
  dev:
    backend: "./mvnw -pl apps/design-editor/backend spring-boot:run   # sobe postgres e mailpit do compose"
    frontend: "npm run dev -w blenderpds   # porta 5173"
  build:
    backend: "./mvnw package"
    frontend: "npm run build -w blenderpds   # tsc strict + vite build"
  test:
    backend: "./mvnw test   # 155 testes (149 starter + 6 app); exige Docker ativo"
    backend_single: "./mvnw -pl framework/backend-starter test -Dtest=SessionWebSocketTest"
    frontend: "npm test -w blenderpds   # Vitest, 29 testes"
    gates: "scripts/check-no-domain-kinds.sh   # framework/ sem literais de kind de domínio"
  migrate:
    how: "Flyway no boot; V1__baseline.sql e V2__session_app_type.sql no starter"
    baseline_on_migrate: true
  lint:
    configured: false
    effective_check: "tsc strict (npm run build) + compilador Java"
ci_cd:
  github_actions: false
  dockerfile: false
  deploy_artifacts: "nenhum; compose.yaml só de desenvolvimento"
```

# 7. RESTRIÇÕES E FRONTEIRAS

```yaml
hard_limits:
  - {name: "MAX_PARTICIPANTS (default)", value: 4, source: "Collab3dProperties.Session.maxParticipants"}
  - {name: "MAX_SNAPSHOT_BYTES (default)", value: 1000000, source: "Collab3dProperties.Snapshot.maxBytes", reachable_over_ws: false}
  - {name: "MAX_OPS_PER_MESSAGE (default)", value: 1000, source: "Collab3dProperties.Sync.maxOpsPerMessage"}
  - {name: "CHUNK_SIZE (default)", value: 200, source: "Collab3dProperties.Sync.chunkSize", note: "também é o tamanho da página do catch-up"}
  - {name: "MAX_VERSION_ENTRIES (default)", value: 100, source: "Collab3dProperties.Sync.maxVersionEntries"}
  - {name: "MAX_CHAT_LENGTH (default)", value: 500, source: "Collab3dProperties.Ws.maxChatLength"}
  - {name: "MAX_ID_LENGTH", value: 100, source: "spi/OperationFields.MAX_ID_LENGTH (ProtocolLimits no ws)"}
  - {name: "WS_TEXT_FRAME_CEILING", value: "~8192 bytes", source: "default do container; não configurado"}
  - {name: "MAX_PENDING_FRAMES (connection)", value: 1000, source: "ws/SessionConnection.java"}
  - {name: "MAX_PENDING_FRAMES (client)", value: 500, source: "apps/design-editor/web/src/network/WebSocketTransport.ts"}
  - {name: "SNAPSHOT_INTERVAL_MS", value: 15000, source: "apps/design-editor/web/src/Main.tsx"}
```

```yaml
boundaries:
  - id: "framework_never_knows_domain_kinds"
    desc: "nenhum literal add_object/remove_object/set_transform/change_color/mesh_edit em framework/"
    enforced_by: "scripts/check-no-domain-kinds.sh (verde ao fim da fase)"
  - id: "app_depends_on_framework"
    desc: "apps/* depende do starter; o starter não depende de apps/* (nenhum import com.grupo03)"
    enforced_by: "revisão; ArchUnit da Fase 2 pode formalizar"
  - id: "api_ws_do_not_use_repositories"
    desc: "..api.. e ..ws.. não dependem de ..repository.."
    enforced_by: "framework/backend-starter/src/test/java/dev/collab3d/api/ControllerLayeringTest.java (ArchUnit)"
  - id: "test_configs_outside_scanned_package"
    desc: "configurações de teste em dev.support ou dev — nunca em dev.collab3d (o scan roda no classpath de teste)"
    enforced_by: "convenção + refactor-notes §10.11"
  - id: "rest_contract"
    desc: "rotas, verbos, status e ApiErrorDto inalterados na Fase 1"
    status: "intacto"
  - id: "ws_protocol"
    desc: "nomes de tipo e campos inalterados; novos comportamentos são apenas error{code} aditivos"
    status: "intacto (caracterizado por SessionWebSocketTest)"
  - id: "op_schema"
    desc: "{id:{siteId,lamport}, author, deps, kind, ...campos-do-kind}"
    status: "intacto; validação por kind agora é da aplicação"
  - id: "db_schema"
    desc: "mesmas tabelas/colunas/constraints da v0.1 + sessions.app_type (aditiva)"
    status: "aditivo"
  - id: "single_instance"
    desc: "SessionConnectionRegistry e SessionStateStore são memória do processo"
  - id: "actor_identity"
    desc: "userId/hostId ainda vêm de path/body/query, não do SecurityContext (Fase 3)"
```

# 8. STATUS E DÍVIDA TÉCNICA

```yaml
status:
  implemented_backend_framework:
    - {feature: "Monorepo Maven com parent e dois módulos", evidence: "pom.xml:14-25"}
    - {feature: "Auto-configuração com component/entity/repository scan e propriedades collab3d.*", evidence: "autoconfigure/Collab3dAutoConfiguration.java:39-47"}
    - {feature: "SPI dos hot-spots com defaults substituíveis", evidence: "spi/* + spi/defaults/*"}
    - {feature: "Despachante WebSocket + MessageCatalog (tipo duplicado falha no boot)", evidence: "ws/SessionSocketHandler.java:70-84, ws/MessageCatalog.java:23-31"}
    - {feature: "Validação genérica de envelope + registro de kinds", evidence: "ws/OperationValidator.java:60-107, ws/OperationKindRegistry.java:25-37"}
    - {feature: "Kinds do editor na aplicação", evidence: "apps/design-editor/backend/.../kinds/*.java"}
    - {feature: "Sequenciador isolado (lock, seq, dedupe)", evidence: "sequencer/OperationSequencer.java:50-88"}
    - {feature: "Admissão por política + estado reduzido por sala", evidence: "sequencer/OperationAppender.java:57-99, session/SessionStateStore.java:57-78"}
    - {feature: "Cadeias de join/capacidade/visibilidade no serviço", evidence: "session/SessionServiceImpl.java (assertJoinable/visibleTo)"}
    - {feature: "sessions.app_type (V2)", evidence: "db/migration/V2__session_app_type.sql"}
    - {feature: "Eventos de ciclo de vida after-commit", evidence: "session/SessionLifecycleDispatcher.java:29-49"}
    - {feature: "Catch-up paginado por seq", evidence: "ws/handler/SyncHelloHandler.java (sendCatchUp)"}
  implemented_apps:
    - {feature: "Editor atual completo (REST + WS + CRDT client-side)", evidence: "apps/design-editor/web (inalterado)"}
  tests:
    starter: "149 testes — SessionWebSocketTest 9, SessionServiceImplTest 17, UserControllerTest 16, UserServiceImplTest 12, FriendRequestControllerTest 11, ExceptionHandlingTest 9, SessionControllerTest 9, EntityMappingTest 9, AuthControllerTest 7, UserDetailsServiceImplTest 7, SessionStateStoreTest 5, OperationKindRegistryTest 5, SessionRepositoryTest 4, UserRepositoryTest 4, EmailServiceImplTest 3, ControllerLayeringTest 2, SessionLifecycleTest 2, SequencerConcurrencyTest 1, AdmissionPolicyTest 1, SyncCatchUpTest 1, JoinPolicyTest 1, SessionAppTypeTest 1, StarterContextTest 1, EmailConfirmationEndToEndTest 1"
    app: "6 testes — BlenderpdsApplicationTests 1, EditorKindValidatorsTest 5"
    frontend: "29 testes Vitest (CRDT)"
  partial:
    - {feature: "Estado reduzido no servidor", gap: "existe e é exercitado por teste, mas nenhuma aplicação declara reducer ainda"}
    - {feature: "Snapshot como reidratação", gap: "sem fromSnapshot e limitado a ~8 KB por frame"}
  stub_or_dead:
    - {feature: "OperationAppender.appendSystem", state: "UnsupportedOperationException (Fase 4)"}
    - {feature: "collab3d.rate-limit", state: "propriedade sem uso (Fase 3)"}
    - {feature: "SessionService.syncSince", state: "usado por testes/serviço, não pelo handler (o handler usa syncSinceSeq)"}
```

```yaml
technical_debt:
  resolved_in_phase1:
    - {id: "linear_scans", how: "syncSince pagina por seq; sync_hello usa syncSinceSeq(sessionId, cursor, chunkSize) e envia um frame por página (P1.12)"}
    - {id: "stub_or_dead__syncSinceSeq", how: "passou a ser o caminho do catch-up (P1.12)"}
    - {id: "god_handler", how: "SessionSocketHandler virou despachante; tipos em ws/handler (P1.5)"}
    - {id: "hardcoded_kinds", how: "kinds saíram do framework para apps/design-editor/backend + OperationKindRegistry (P1.6)"}
    - {id: "hardcoded_limits", how: "MAX_PARTICIPANTS/MAX_CHAT_LENGTH/CHUNK_SIZE/MAX_OPS/MAX_VERSION_ENTRIES/MAX_SNAPSHOT_BYTES viraram collab3d.* (P1.3, aplicados em P1.6/P1.8/P1.9)"}
  open:
    - {id: "ws_frame_limit_8kb", desc: "frames acima de ~8 KB fecham a conexão (1009); um chunk de 200 operações não cabe", phase: "pré-requisito de P3.3"}
    - {id: "append_system_unimplemented", desc: "operações emitidas pelo servidor", phase: "Fase 4"}
    - {id: "session_dto_fixed_capacity", desc: "SessionController.toDto anuncia MAX_PARTICIPANTS fixo, ignorando SessionCapacityPolicy", phase: "Fase 2/4"}
    - {id: "rate_limit_unused", desc: "collab3d.rate-limit existe e não é aplicado", phase: "P3.4"}
    - {id: "actor_identity_from_request", desc: "userId/hostId de path/body/query", phase: "P3.1"}
    - {id: "no_ci", desc: "nenhum pipeline; gates rodados manualmente", phase: "P3.4"}
    - {id: "in_memory_registry", desc: "sem broker, sem escala horizontal", phase: "P3.4"}
    - {id: "user_enumeration", desc: "GET /users lista todos", phase: "P3.4"}
    - {id: "hardcoded_dev_credentials", desc: "senha do Postgres literal em compose.yaml", phase: "P3.4"}
    - {id: "oauth2_starter_unused", desc: "starter OAuth2 sem client configurado", phase: "P3.2"}
    - {id: "doc_code_drift", desc: "README aponta para docs/backend-architecture.md e docs/frontend-architecture.md removidos", phase: "P3.4"}
    - {id: "crdt_revive_ignores_color", desc: "add_object que revive não regrava color", phase: "P2.3"}
    - {id: "crdt_change_reported_by_stamp", desc: "LWW reporta mudança por carimbo mesmo com valor idêntico", phase: "P2.3"}
    - {id: "visibility_n_plus_one", desc: "getJoinableSessionsFor monta um SessionContext por sala listada", phase: "avaliar na Fase 2"}
```

# 9. DELTA EM RELAÇÃO À VERSÃO ANTERIOR

Comparação com `architecture-v0.1-fase0-preparacao.md` (commit `a8e0244`).

## 9.1 Adicionado

| Caminho | O quê |
|---|---|
| `pom.xml` (raiz) | Parent Maven `dev.collab3d:collab3d-parent` (packaging pom, módulos framework/apps) |
| `framework/backend-starter/pom.xml` | Módulo do framework (`collab3d-spring-boot-starter`) |
| `apps/design-editor/backend/pom.xml` | Módulo da aplicação 1 (`design-editor-backend`) |
| `framework/backend-starter/src/main/java/dev/collab3d/autoconfigure/` | `Collab3dAutoConfiguration`, `Collab3dProperties`, `JpaAuditingConfig` |
| `framework/backend-starter/src/main/java/dev/collab3d/spi/` | Todas as interfaces dos hot-spots, records de contexto/resultado, exceções e `OperationFields`, `SessionLifecycleListener` |
| `.../spi/defaults/` | `AdmitAllPolicy`, `HostFriendJoinPolicy`, `FixedCapacityPolicy`, `AlwaysVisiblePolicy`, `HostOnlySnapshotPolicy` |
| `.../ws/handler/` | `SyncHelloHandler`, `SyncOpsHandler`, `SnapshotHandler`, `PresenceRelayHandler`, `ChatRelayHandler` |
| `.../ws/` | `MessageCatalog`, `OperationKindRegistry`, `WsFrames`, `ProtocolLimits`, `ConnectionBroadcaster`, `ConnectionOperationAppender` |
| `.../sequencer/` | `OperationSequencer`, `OperationAppender` |
| `.../session/` | `SessionContextFactory`, `SessionStateStore`, `SessionCreatedEvent`, `ParticipantJoinedEvent`, `ParticipantLeftEvent`, `SessionLifecycleDispatcher` |
| `apps/design-editor/backend/src/main/java/com/grupo03/blenderpds/kinds/` | `AddObjectKindValidator`, `RemoveObjectKindValidator`, `SetTransformKindValidator`, `ChangeColorKindValidator` |
| `framework/backend-starter/src/main/resources/db/migration/V2__session_app_type.sql` | `sessions.app_type varchar(32) NOT NULL DEFAULT 'design'` |
| `scripts/check-no-domain-kinds.sh` | Gate grep de kinds de domínio no framework |
| `docs/architecture/architecture-v0.2-fase1-core-backend.md` | Este snapshot |
| Testes novos | `SequencerConcurrencyTest`, `AdmissionPolicyTest`, `SyncCatchUpTest`, `JoinPolicyTest`, `SessionStateStoreTest`, `SessionAppTypeTest`, `SessionLifecycleTest`, `OperationKindRegistryTest`, `BlenderpdsApplicationTests`, `EditorKindValidatorsTest`; fixtures `dev.TestKindsConfiguration`, `dev.support.*` |

## 9.2 Movido

| De | Para | Como |
|---|---|---|
| `backend/blenderpds/src/main/java/com/grupo03/blenderpds/**` | `framework/backend-starter/src/main/java/dev/collab3d/**` | `git mv` + troca de pacote em P1.1/P1.2 |
| `backend/blenderpds/pom.xml` | `framework/backend-starter/pom.xml` | `git mv` |
| `backend/blenderpds/src/test/java/com/grupo03/blenderpds/**` | `framework/backend-starter/src/test/java/dev/collab3d/**` | `git mv` (os testes da aplicação, no domínio, foram para o app) |
| `backend/blenderpds/src/main/resources/db/migration/V1__baseline.sql` | `framework/backend-starter/src/main/resources/db/migration/V1__baseline.sql` | `git mv` |
| `compose.yaml` (de `backend/blenderpds/`) | raiz do repositório | `git mv` |
| Wrapper Maven | raiz (`mvnw`, `mvnw.cmd`, `.mvn/`) | `git mv` |
| `BlenderpdsApplication` + `application.properties` | `apps/design-editor/backend/` | `git mv` (P1.2) |
| `ControllerLayeringTest` | `dev.collab3d.api` (padrão `..api..`/`..ws..`) | `git mv` + ajuste do pacote |

## 9.3 Removido

- `backend/` como unidade Maven única (não existe mais; o diretório foi esvaziado).
- Literais de kind de operação do framework (`OperationValidator.hasValidPayload` com `switch`).
- Constantes de limite espalhadas no handler (`CHUNK_SIZE`, `MAX_CHAT_LENGTH`, `MAX_VERSION_ENTRIES`).
- `SessionServiceImpl.appendOperations` como dono do lock/seq/dedupe (agora delega ao sequenciador).

## 9.4 Alterado (comportamento interno, contrato preservado)

| Caminho | Alteração |
|---|---|
| `SessionSocketHandler` | despachante: parse → `MessageCatalog` → handler; lock pela `Delivery`; erros por exceção do SPI |
| `OperationValidator` | valida só o envelope e delega o payload ao `OperationKindRegistry`; limite por `collab3d.sync.max-ops-per-message` |
| `SessionServiceImpl` | `assertJoinable` usa as cadeias de políticas; `getJoinableSessionsFor` aplica visibilidade; publica eventos; escreve `appType` |
| `SessionService.syncSinceSeq` | assinatura passou a `(sessionId, seq, limit)`; `syncSince` pagina por `seq` |
| `SyncHelloHandler` | catch-up página a página (`chunk-size` por frame) |
| `Collab3dProperties` | `app-type`, `session.*`, `sync.*`, `snapshot.*`, `ws.*`, `rate-limit` (aplicados exceto `rate-limit`) |
| `WebSocketConfig` | origem lida de `collab3d.ws.allowed-origins` (com `WS_ALLOWED_ORIGINS` como fallback) |
| `Session` | coluna `app_type` (`NOT NULL DEFAULT 'design'`) |
| `SessionCreateDto` | campo opcional `appType` (aceito e ignorado; deploy fixa o tipo) |

## 9.5 Dívidas técnicas resolvidas (ids do manifesto v0.0/v0.1)

- `linear_scans` — **resolvida** em P1.12 (página por `seq`, sem carregar o log inteiro).
- `stub_or_dead / SessionService.syncSinceSeq` — **encerrada**: é o caminho do `sync_hello`.
- Conjunto de hot-spots HS1/HS2/HS3/HS5/HS6 com defaults substituíveis — **implementado** na Fase 1.
- `ddl_auto_destructive` / `duplicate_root_package` (Fase 0) — continuam resolvidas; a V2 foi aplicada
  a uma base existente com `validate` verde.

## 9.6 Dívidas técnicas novas

- `append_system_unimplemented` — entrada de operações emitidas pelo servidor declarada e não
  implementada (Fase 4).
- `session_dto_fixed_capacity` — o DTO de sessão anuncia 4 fixo, ignorando `SessionCapacityPolicy`.
- `visibility_n_plus_one` — leitura de contexto por sala listada quando há política de visibilidade.
- `test_configs_scanned` (evitada, registrada) — a auto-configuração escaneia `dev.collab3d` no
  classpath de teste; configurações de teste precisam viver fora desse pacote.

## 9.7 Contratos (REST / WS / schema de operações / banco)

| Contrato | Mudança | Tipo |
|---|---|---|
| REST | nenhuma rota/verbo/status/shape alterado; `POST /sessions` aceita um campo opcional a mais (`appType`) | **aditiva** |
| WebSocket | nenhum tipo/campo removido ou renomeado; rejeição de admissão responde `error{OP_REJECTED}` por operação (antes a política não existia) | **aditiva** |
| Schema de operações | envelope idêntico (`{id, author, deps, kind, ...campos}`); o servidor só aceita kinds registrados | **compatível** (kind desconhecido já era recusado) |
| Banco de dados | `sessions.app_type varchar(32) NOT NULL DEFAULT 'design'` (V2) | **aditiva** |

O editor atual roda sem alteração de frontend contra este backend: o gate da fase foi verificado com
`SessionWebSocketTest` (asserts do P0.2 intactos), `SessionControllerTest` inalterado e
`BlenderpdsApplicationTests` subindo a aplicação real com os quatro kinds registrados.
