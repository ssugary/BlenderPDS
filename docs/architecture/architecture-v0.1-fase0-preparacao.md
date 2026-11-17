---
version: "0.1"
phase: "fase 0 — preparação e rede de segurança"
commit_sha: "a8e0244"
date: "2026-11-17"
previous_version: "architecture-v0.0-baseline.md"
scope: "Snapshot completo do repositório ao fim da Fase 0 (P0.0–P0.6) da refatoração BlenderPDS -> collab3d: mesmo produto (editor 3D colaborativo), com baseline de arquitetura versionada, premissas verificadas, testes de caracterização do WebSocket, ArchUnit, Vitest no frontend, Flyway com ddl-auto=validate e raiz convertida em npm workspaces com o SPA em apps/design-editor/web. Nenhum contrato REST/WS/schema de operações foi alterado."
---

# 1. VISÃO GERAL

Editor 3D de modelagem em navegador com edição colaborativa em tempo real — **o produto não
mudou nesta fase**. O frontend SPA (React + three.js) mantém a cena como projeção de um log de
operações CRDT; o backend Spring Boot persiste contas, amizades, salas e o log de operações,
atuando como sequenciador global (atribui `seq`, deduplica) sem interpretar o CRDT.

O que a Fase 0 mudou foi a **rede de segurança** e a **base de infraestrutura**: documentação de
arquitetura versionada e imutável, premissas verificadas contra o código real, testes de
caracterização do protocolo WebSocket, regras de camadas executáveis (ArchUnit), testes unitários
do CRDT (Vitest), migrações de banco (Flyway + `validate`) e monorepo npm com o SPA já no caminho
final (`apps/design-editor/web`).

```yaml
stack:
  backend:
    language: "Java 21"
    evidence: "backend/blenderpds/pom.xml:30"
    framework: "Spring Boot 4.1.1 (parent)"
    evidence: "backend/blenderpds/pom.xml:8"
    json: "Jackson 3 — tools.jackson.core:jackson-databind:3.1.5 (via spring-boot-starter-jackson)"
    json_evidence: "./mvnw dependency:tree; websocket/SessionSocketHandler.java:24-28"
    annotations: "com.fasterxml.jackson.annotation (jackson-annotations 2.21, transitivo do databind 3.x)"
    json_annotations_evidence: "./mvnw dependency:tree; dto/UserDto.java:4"
    migrations: "Flyway — spring-boot-starter-flyway + flyway-database-postgresql"
    migrations_evidence: "backend/blenderpds/pom.xml:65-75"
    modules:
      - {name: "spring-boot-starter-webmvc", evidence: "backend/blenderpds/pom.xml:55"}
      - {name: "spring-boot-starter-data-jpa", evidence: "backend/blenderpds/pom.xml:39"}
      - {name: "spring-boot-starter-security", evidence: "backend/blenderpds/pom.xml:43"}
      - {name: "spring-boot-starter-security-oauth2-client", evidence: "backend/blenderpds/pom.xml:47", used: false}
      - {name: "spring-boot-starter-websocket", evidence: "backend/blenderpds/pom.xml:59"}
      - {name: "spring-boot-starter-mail", evidence: "backend/blenderpds/pom.xml:63"}
      - {name: "spring-boot-starter-flyway", evidence: "backend/blenderpds/pom.xml:69"}
      - {name: "flyway-database-postgresql", evidence: "backend/blenderpds/pom.xml:73", scope: "runtime"}
      - {name: "spring-boot-starter-validation", evidence: "backend/blenderpds/pom.xml:51"}
      - {name: "spring-boot-starter-actuator", evidence: "backend/blenderpds/pom.xml:35"}
      - {name: "spring-boot-docker-compose", evidence: "backend/blenderpds/pom.xml", scope: "runtime"}
      - {name: "lombok", evidence: "backend/blenderpds/pom.xml:95-96"}
      - {name: "com.tngtech.archunit:archunit:1.4.1", evidence: "backend/blenderpds/pom.xml:135-139", scope: "test"}
    build: "Maven Wrapper 3.10.0 — backend/blenderpds/.mvn/wrapper/maven-wrapper.properties"
    modules_maven: "1 (backend/blenderpds); ainda NÃO existe pom pai na raiz — entra em P1.1"
  frontend:
    location: "apps/design-editor/web (workspace npm `blenderpds`)"
    language: "TypeScript 7.0.2 (strict)"
    evidence: "apps/design-editor/web/package.json:27, apps/design-editor/web/tsconfig.json"
    framework: "React 19.3.0"
    evidence: "apps/design-editor/web/package.json:17"
    router: "react-router-dom 7.18.x"
    3d: "three 0.161.x"
    bundler: "Vite 8.3.x + @vitejs/plugin-react"
    test_runner: "Vitest 5.1.x"
    test_runner_evidence: "apps/design-editor/web/package.json:13,30; apps/design-editor/web/vitest.config.ts"
    node_engine: "^20.19.0 || >=22.12.0"
    engine_evidence: "package.json:5-7, apps/design-editor/web/package.json:7"
    workspaces: "raiz: {\"private\": true, \"workspaces\": [\"apps/*/web\"]}"
    workspaces_evidence: "package.json:1-12"
  data:
    engine: "PostgreSQL 16"
    evidence: "backend/blenderpds/compose.yaml"
    orm: "Spring Data JPA / Hibernate (schema validado, não criado)"
    evidence: "backend/blenderpds/src/main/resources/application.properties:10"
  mail:
    dev: "Mailpit (SMTP 1025, UI 8025)"
    evidence: "backend/blenderpds/compose.yaml"
```

# 2. MAPA DE DIRETÓRIOS E ARQUITETURA

```yaml
directories:
  - path: "."
    responsibility: "Raiz do monorepo: package.json com npm workspaces (apps/*/web). Sem pom pai ainda."
  - path: "apps/design-editor/web"
    responsibility: "SPA atual (workspace `blenderpds`): src/api, src/collab, src/core, src/entity, src/manager, src/network, src/react, src/tool, src/command; vitest.config.ts e os 4 arquivos *.test.ts do CRDT"
  - path: "backend/blenderpds"
    responsibility: "Única unidade Maven (Spring Boot 4.1.1): aplicação, testes, compose.yaml e as migrações Flyway"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/config"
    responsibility: "SecurityConfig (CSRF+session), WebSocketConfig (handler/interceptor/origin), JpaAuditingConfig"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/controller"
    responsibility: "Adaptadores REST: AuthController, UserController, SessionController, ApiExceptionHandler"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/service"
    responsibility: "Interfaces de caso de uso + records de entrada/evento: AuthService, UserService, SessionService, EmailService, SessionEndedEvent, SessionOperationInput"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/service/implementation"
    responsibility: "Implementações transacionais: AuthServiceImpl, UserServiceImpl, SessionServiceImpl, EmailServiceImpl, UserDetailsServiceImpl"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model"
    responsibility: "Entidades JPA e enums: User, FriendRequest, Session, SessionParticipant, SessionOperation, EmailConfirmationToken, Role, SessionStatus"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository"
    responsibility: "Spring Data JPA: UserRepository, SessionRepository, SessionParticipantRepository, SessionOperationRepository, FriendRequestRepository, EmailConfirmationTokenRepository"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/dto"
    responsibility: "Contratos JSON: UserDto, LoginDto, SessionDto, SessionCreateDto, SessionJoinDto, SessionParticipantDto, FriendRequestDto, FriendRequestCreateDto, ApiErrorDto"
  - path: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/websocket"
    responsibility: "Handshake (SessionHandshakeInterceptor), handler de frames (SessionSocketHandler), registro e lock por sessão (SessionConnectionRegistry, SessionConnection), validação (OperationValidator)"
  - path: "backend/blenderpds/src/main/resources/db/migration"
    responsibility: "V1__baseline.sql — schema completo gerado por pg_dump do banco criado pelo Hibernate"
  - path: "backend/blenderpds/src/test/java"
    responsibility: "15 classes de teste, 121 testes executados (controllers, services, repositories, model mapping, WebSocket, camadas com ArchUnit)"
  - path: "docs/architecture"
    responsibility: "Histórico imutável de arquitetura: architecture-v0.0-baseline.md, architecture-v0.1-fase0-preparacao.md, legacy/ e o índice README.md"
  - path: "docs"
    responsibility: "refactor-notes.md (premissas e decisões) e plano-framework-collab3d-completo.md"
```

Padrão arquitetural backend: **Layered / Ports-and-Adapters leve** (inalterado nesta fase).
Controladores e handler WebSocket chamam apenas interfaces de serviço; serviços não conhecem HTTP
nem sockets. Agora a regra é **executável**: `ControllerLayeringTest` importa as classes com
ArchUnit e proíbe dependência de `..controller..`/`..websocket..` em `..repository..`
(`backend/blenderpds/src/test/java/com/grupo03/blenderpds/controller/ControllerLayeringTest.java:33-42`).

Padrão arquitetural frontend: **Composition Root + Managers/Controllers/Tools/Commands +
EventBus global + CRDT client-side** (inalterado): `apps/design-editor/web/src/core/Engine.ts`,
`.../core/controllers/ActionRouter.ts`, `.../core/EventBus.ts`, `.../collab/DocumentState.ts`.

# 3. MODELO DE DADOS E ESTADO

```yaml
database:
  engine: "PostgreSQL 16"
  schema_management: "Flyway (baseline-on-migrate=true) + Hibernate ddl-auto=validate"
  evidence: "backend/blenderpds/src/main/resources/application.properties:10,14"
  migrations:
    present: true
    files: ["backend/blenderpds/src/main/resources/db/migration/V1__baseline.sql"]
    baseline_origin: "pg_dump --schema-only --no-owner --no-privileges de um banco criado por ddl-auto=create"
    history_table: "flyway_schema_history"
    dev_database_state: "base de dev/teste foi ADOTADA como baseline (linha '1 | << Flyway Baseline >> | BASELINE'); base nova executa V1 de verdade"
    evidence_clean_db: "log de boot: 'Migrating schema \"public\" to version \"1 - baseline\"' + 'Successfully applied 1 migration'"
  resolved_debt: "ddl_auto_destructive (v0.0) — o schema não é mais recriado a cada start"

tables:
  users:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/User.java:41,48"
    ddl: "backend/blenderpds/src/main/resources/db/migration/V1__baseline.sql:98"
    columns:
      id: "bigint IDENTITY"
      nickname: "varchar(50) not null"
      email: "varchar(100) not null unique (username de login)"
      password_hash: "varchar(100) not null"
      role: "varchar(20) not null + CHECK (USER|ADMIN)"
      email_verified: "boolean not null"
      created_at: "timestamptz"
    relationships:
      - "friendList: @ManyToMany self via user_friends(user_id, friend_id)"
  friend_requests:
    columns: {id: "IDENTITY", sender_id: "FK users", receiver_id: "FK users", created_at: "timestamptz"}
    constraints: ["uk_friend_request_pair (sender_id, receiver_id)"]
  sessions:
    columns:
      id: "IDENTITY"
      user_id: "FK users (host); nome mantido por compatibilidade de schema"
      status: "varchar(20) not null + CHECK (WAITING|ACTIVE|ENDED)"
      code: "varchar(12) not null unique (10 chars gerados)"
      scene_snapshot: "text (JSON opaco, denormalização)"
      created_at: "timestamptz"
      updated_at: "timestamptz"
      ended_at: "timestamptz nullable"
  session_participants:
    columns: {id: "IDENTITY", session_id: "FK sessions", user_id: "FK users", active: "boolean", joined_at: "timestamptz", last_seen_at: "timestamptz"}
    constraints: ["uk_session_participant (session_id, user_id)"]
  session_operations:
    columns:
      id: "IDENTITY"
      session_id: "FK sessions not null"
      seq: "bigint not null (ordem total do servidor)"
      site_id: "varchar(100) not null (réplica Lamport)"
      lamport: "bigint not null"
      author_id: "FK users nullable (detachAuthor em delete)"
      kind: "varchar(32) not null (add_object|remove_object|set_transform|change_color)"
      payload: "text not null (ENVELOPE JSON completo; ver §4)"
      created_at: "timestamptz"
    constraints:
      - "uk_session_operation_seq (session_id, seq) — V1__baseline.sql:135"
      - "uk_session_operation_op (session_id, site_id, lamport) — V1__baseline.sql:133"
  email_confirm_tokens:
    columns: {id: "IDENTITY", token: "varchar(64) not null unique (UUID)", user_id: "FK users", expires_at: "timestamptz"}
    ttl: "24h — UserServiceImpl.CONFIRM_TOKEN_TTL"

enums:
  Role: {values: [USER, ADMIN], evidence: "model/Role.java:6"}
  SessionStatus: {values: [WAITING, ACTIVE, ENDED], evidence: "model/SessionStatus.java:15"}

frontend_state:
  document_model:
    - {piece: "ReplicaSession", role: "clock+log+state por réplica", evidence: "apps/design-editor/web/src/collab/ReplicaSession.ts:13-15,26,41"}
    - {piece: "OpLog", role: "lista append-only + versionVector + dedupe por OpId", evidence: ".../collab/OpLog.ts:11"}
    - {piece: "DocumentState", role: "CRDT: LWWRegister em transform/color, addStamp/removeStamp como tombstones; apply() devolve Change[]; replay() reconstrói prefixo", evidence: ".../collab/DocumentState.ts:33"}
    - {piece: "LWWRegister", role: "register por campo com desempate por OpId", evidence: ".../collab/LWWRegister.ts"}
    - {piece: "SceneProjector", role: "único escritor de conteúdo compartilhado no SceneManager", evidence: ".../collab/SceneProjector.ts:14"}
    - {piece: "PresenceService", role: "estado efêmero de seleção e lock, fora do OpLog", evidence: ".../collab/PresenceService.ts:17"}
  persistence_client:
    - {key: "blenderpds:user", store: "localStorage", content: "usuário autenticado (sem token)", evidence: ".../react/ui/UseSocial.ts:71,78,96,98"}
  ui_state: "React useState/useMemo por tela; nenhuma store global"
```

# 4. ENTRY POINTS E FLUXOS

```yaml
entry_points:
  backend:
    file: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/BlenderpdsApplication.java"
    symbol: "main(String[] args)"
    annotation: "@SpringBootApplication"
    port: "8080 (default Spring Boot; README.md)"
  backend_websocket:
    path: "/ws/sessions/*"
    evidence: "config/WebSocketConfig.java:35"
    handshake: "SessionHandshakeInterceptor.beforeHandshake"
    handler: "SessionSocketHandler"
  frontend:
    html: "apps/design-editor/web/index.html:13"
    script: "/src/Main.tsx"
    routes_root: "apps/design-editor/web/src/react/ui/AppRoutes.tsx:122-126"
```

Rotas REST (inalteradas; todas sob `authenticated()` exceto as quatro públicas em
`config/SecurityConfig.java:69-73`):

```yaml
rest_routes:
  - {method: "GET", path: "/auth/csrf", handler: "AuthController.csrf", auth: "public", evidence: "controller/AuthController.java:40"}
  - {method: "POST", path: "/auth/login", handler: "AuthController.login", auth: "public", evidence: "controller/AuthController.java:50"}
  - {method: "POST", path: "/auth/logout", handler: "AuthController.logout", auth: "session", evidence: "controller/AuthController.java:61"}
  - {method: "POST", path: "/users", handler: "UserController.register", auth: "public", evidence: "controller/UserController.java:33"}
  - {method: "GET", path: "/users", handler: "UserController.list", auth: "session", evidence: "controller/UserController.java:53"}
  - {method: "GET", path: "/users/{id}", handler: "UserController.get", auth: "session", evidence: "controller/UserController.java:58"}
  - {method: "PUT", path: "/users/{id}", handler: "UserController.update", auth: "session", evidence: "controller/UserController.java:66"}
  - {method: "DELETE", path: "/users/{id}", handler: "UserController.delete", auth: "session", evidence: "controller/UserController.java:83"}
  - {method: "GET", path: "/users/confirm-email", handler: "UserController.confirmEmailByToken", auth: "public", evidence: "controller/UserController.java:97"}
  - {method: "POST", path: "/users/{id}/confirm-email", handler: "UserController.confirmEmail", auth: "session", evidence: "controller/UserController.java:106"}
  - {method: "POST", path: "/users/{id}/friend-requests", handler: "UserController.sendFriendRequest", auth: "session", evidence: "controller/UserController.java:125"}
  - {method: "GET", path: "/users/{id}/friend-requests", handler: "UserController.pendingFriendRequests", auth: "session", evidence: "controller/UserController.java:133"}
  - {method: "GET", path: "/users/{id}/friend-requests/sent", handler: "UserController.sentFriendRequests", auth: "session", evidence: "controller/UserController.java:141"}
  - {method: "POST", path: "/users/{id}/friend-requests/{requestId}/accept", handler: "UserController.acceptFriendRequest", auth: "session", evidence: "controller/UserController.java:152"}
  - {method: "POST", path: "/users/{id}/friend-requests/{requestId}/reject", handler: "UserController.rejectFriendRequest", auth: "session", evidence: "controller/UserController.java:160"}
  - {method: "DELETE", path: "/users/{id}/friend-requests/{requestId}", handler: "UserController.cancelFriendRequest", auth: "session", evidence: "controller/UserController.java:168"}
  - {method: "GET", path: "/users/{id}/friends", handler: "UserController.friends", auth: "session", evidence: "controller/UserController.java:176"}
  - {method: "DELETE", path: "/users/{id}/friends/{friendId}", handler: "UserController.removeFriend", auth: "session", evidence: "controller/UserController.java:182"}
  - {method: "POST", path: "/sessions", handler: "SessionController.create", auth: "session", evidence: "controller/SessionController.java:40"}
  - {method: "GET", path: "/sessions/{id}", handler: "SessionController.get", auth: "session", evidence: "controller/SessionController.java:46"}
  - {method: "GET", path: "/sessions/code/{code}", handler: "SessionController.getByCode", auth: "session", evidence: "controller/SessionController.java:55"}
  - {method: "GET", path: "/sessions/open/{userId}", handler: "SessionController.openSessionOf", auth: "session", evidence: "controller/SessionController.java:70"}
  - {method: "GET", path: "/sessions/{id}/participants", handler: "SessionController.participants", auth: "session", evidence: "controller/SessionController.java:78"}
  - {method: "POST", path: "/sessions/{id}/join", handler: "SessionController.join", auth: "session", evidence: "controller/SessionController.java:87"}
  - {method: "POST", path: "/sessions/{id}/leave", handler: "SessionController.leave", auth: "session", evidence: "controller/SessionController.java:93"}
  - {method: "POST", path: "/sessions/{id}/end", handler: "SessionController.end", auth: "session", evidence: "controller/SessionController.java:100"}
  - {method: "GET", path: "/sessions/friends/{userId}", handler: "SessionController.friendsSessions", auth: "session", evidence: "controller/SessionController.java:110"}
  - {method: "GET", path: "/sessions/{id}/state", handler: "SessionController.state", auth: "session", evidence: "controller/SessionController.java:119"}
  - {note: "Frontend chama /api/<path>; Vite remove o prefixo", evidence: "apps/design-editor/web/vite.config.ts:22, apps/design-editor/web/src/api/Backend.ts:14"}
```

Protocolo WebSocket (inalterado; agora congelado por testes de caracterização):

```yaml
ws_protocol:
  url: "ws(s)://<host>/ws/sessions/{sessionId}?userId={userId}"
  url_builder: "apps/design-editor/web/src/network/WebSocketTransport.ts:52"
  gate: "SessionHandshakeInterceptor.beforeHandshake → SessionService.connectParticipant (404/403/409 como status HTTP)"
  client_to_server:
    - {type: "sync_hello", payload: "{vv: VersionVector}", handler: "SessionSocketHandler.handleHello", evidence: "websocket/SessionSocketHandler.java:94,133"}
    - {type: "sync_ops", payload: "{ops: Operation[]}", handler: "SessionSocketHandler.handleOps", evidence: "websocket/SessionSocketHandler.java:95,157"}
    - {type: "presence", payload: "{siteId, selectedObjectId}", handler: "SessionSocketHandler.relayPresence", evidence: "websocket/SessionSocketHandler.java:96,192"}
    - {type: "chat", payload: "{text}", handler: "SessionSocketHandler.relayChat", evidence: "websocket/SessionSocketHandler.java:97,212"}
    - {type: "scene_snapshot", payload: "{snapshot}", handler: "SessionSocketHandler.handleSnapshot", evidence: "websocket/SessionSocketHandler.java:98,230"}
  server_to_client:
    - {type: "sync_ops", note: "catch-up e relay; operações carregam seq", evidence: "websocket/SessionSocketHandler.java:133-145,278-288"}
    - {type: "sync_ack", note: "{siteId, lamport, seq}"}
    - {type: "session_roster", note: "{sessionId, status, participants[{userId,nickname,active}]}", evidence: "websocket/SessionSocketHandler.java:248"}
    - {type: "presence", note: "somente relay"}
    - {type: "chat", note: "somente relay, sem persistência"}
    - {type: "error", note: "{code} em UNKNOWN_TYPE|INVALID_MESSAGE|INTERNAL_ERROR|INVALID_OP|OP_REJECTED|SYNC_FAILED|INVALID_SNAPSHOT|SNAPSHOT_TOO_LARGE|SNAPSHOT_REJECTED"}
  ordering_guarantee: "persistência e relay dentro do lock por sessão (SessionConnectionRegistry.runLocked)"
  frame_size_ceiling: "~8 KB por frame de texto (buffer padrão do Tomcat, nada configura): acima disso a conexão fecha com 1009 antes do handler"
  frame_size_evidence: "SessionWebSocketTest#textFrameAboveTheContainerBufferClosesTheConnection"
  initial_roster_delay: "a conexão nasce em catchingUp: o roster inicial só é entregue depois do primeiro sync_hello (SessionConnection.send/finishCatchUp)"
  characterisation_tests: ["currentProtocolRoundTripIsFrozen (SessionWebSocketTest.java:237)", "unknownTypeAndMalformedFrameAreAnsweredWithErrorsAndTheConnectionSurvives (:301)", "snapshotFrameIsStoredAndAMissingOneIsRejected (:323)", "textFrameAboveTheContainerBufferClosesTheConnection (:348)"]
```

Envelope de operação (verificado em P0.1 — os campos do `kind` estão **no nível do envelope**,
não dentro de um objeto `payload`):
`{id:{siteId,lamport}, author, deps[], kind, ...campos-do-kind}`; `author` deve ser igual a
`id.siteId` e `deps` deve estar vazio (contrato atual). O servidor persiste o **envelope inteiro**
em `session_operations.payload` (`websocket/OperationValidator.java:104`) e anexa `seq` ao
retransmitir (`websocket/SessionSocketHandler.java:287-288`).

Fluxo REST: `Controller → Service(interface) → ServiceImpl(@Transactional) → Repository → PostgreSQL`,
com exceções mapeadas por `ApiExceptionHandler` para `ApiErrorDto{status,error,message}`.

```yaml
flows:
  - {from: "Toolbar/Keyboard/Gizmo", to: "ActionRouter", via: "eventos GLOBAL_BUS"}
  - {from: "ActionRouter", to: "CommandManager", via: "execute(Command)"}
  - {from: "Command", to: "ReplicaSession", via: "commit(NewOperation)", evidence: ".../command/implementation/CreatePrimitiveCommand.ts:33"}
  - {from: "ReplicaSession", to: "DocumentState", via: "state.apply(op) → Change[]", evidence: ".../collab/ReplicaSession.ts:26"}
  - {from: "ReplicaSession", to: "SyncEngine", via: "onLocalOp", evidence: ".../collab/SyncEngine.ts:37,67"}
  - {from: "SyncEngine", to: "WebSocketTransport", via: "send({type:'sync_ops'})"}
  - {from: "SessionSocketHandler", to: "OperationValidator", via: "validateBatch", evidence: "websocket/SessionSocketHandler.java:158"}
  - {from: "SessionSocketHandler", to: "SessionServiceImpl.appendOperations", via: "chamada de serviço sob lock"}
  - {from: "SessionSocketHandler", to: "SessionConnectionRegistry.broadcast", via: "frame sync_ops", evidence: "websocket/SessionSocketHandler.java:180"}
  - {from: "ReplicaSession", to: "SceneProjector", via: "onChange(Change[])"}
  - {from: "SessionServiceImpl.endSession", to: "SessionSocketHandler.onSessionEnded", via: "SessionEndedEvent com @TransactionalEventListener(AFTER_COMMIT) → closeAll"}
```

# 5. DEPENDÊNCIAS EXTERNAS E INTEGRAÇÕES

```yaml
integrations:
  - name: "PostgreSQL 16"
    type: "database"
    config: "backend/blenderpds/compose.yaml (serviço postgres, volume blenderpds-data)"
    injected_by: "spring-boot-docker-compose (pom.xml)"
    note: "o compose é start-and-stop: o container só existe enquanto a aplicação roda"
  - name: "Flyway"
    type: "migração"
    config: "backend/blenderpds/src/main/resources/db/migration/V1__baseline.sql"
  - name: "Mailpit (SMTP de desenvolvimento)"
    type: "email"
    config: "compose.yaml; SMTP 1025, UI 8025"
    client: "JavaMailSender / spring-boot-starter-mail"
  - name: "Vite dev proxy"
    type: "http/ws proxy"
    config: "'/api' com rewrite e '/ws' com ws:true apontando para BACKEND_URL"
    evidence: "apps/design-editor/web/vite.config.ts:22,28"
    cookie_forwarding: "CONFIRMADO por experimento: o header Cookie chega intacto ao alvo no upgrade"
  - name: "APIs externas de terceiros"
    type: "UNKNOWN"
    note: "nenhum SDK ou HTTP client externo em pom.xml ou package.json"
  - name: "Filas / brokers"
    type: "absent"
    note: "relay em memória via SessionConnectionRegistry — backend single-instance"
```

Variáveis de ambiente (apenas chaves):

```yaml
env_vars:
  backend:
    - {key: "MAIL_HOST", default_present: true, evidence: "application.properties:18"}
    - {key: "MAIL_PORT", default_present: true, evidence: "application.properties:19"}
    - {key: "MAIL_USERNAME", default_present: true}
    - {key: "MAIL_PASSWORD", default_present: true}
    - {key: "MAIL_SMTP_AUTH", default_present: true}
    - {key: "MAIL_SMTP_STARTTLS", default_present: true}
    - {key: "MAIL_FROM", default_present: true}
    - {key: "APP_BASE_URL", default_present: true}
    - {key: "WS_ALLOWED_ORIGINS", default_present: true, evidence: "application.properties:38"}
    - {key: "POSTGRES_DB", evidence: "compose.yaml"}
    - {key: "POSTGRES_USER", evidence: "compose.yaml"}
    - {key: "POSTGRES_PASSWORD", evidence: "compose.yaml", note: "valor literal versionado (débito hardcoded_dev_credentials)"}
  frontend:
    - {key: "BACKEND_URL", default: "http://localhost:8080", evidence: "apps/design-editor/web/vite.config.ts:5"}
  injected_by_spring:
    - {key: "SPRING_DATASOURCE_*", note: "preenchido pela integração docker-compose; nomes não declarados no repositório", status: "UNKNOWN"}
```

# 6. COMANDOS OPERACIONAIS

```yaml
commands:
  install:
    frontend: "npm install   # na RAIZ do repo: instala todos os workspaces (apps/*/web)"
    backend: "sem passo explícito — Maven Wrapper resolve dependências no primeiro build"
  dev:
    backend: "cd backend/blenderpds && ./mvnw spring-boot:run"
    backend_side_effects: "Spring Boot Docker Compose sobe postgres e mailpit automaticamente"
    frontend: "npm run dev -w blenderpds   # na raiz; ou `npm run dev` dentro de apps/design-editor/web"
    frontend_port: 5173
  build:
    frontend: "npm run build -w blenderpds   # tsc (strict) && vite build"
    backend: "./mvnw package"
  preview:
    frontend: "npm run preview -w blenderpds"
  test:
    backend: "cd backend/blenderpds && ./mvnw test   # 121 testes; requer Docker ativo"
    frontend: "npm test -w blenderpds   # Vitest: 29 testes em 4 arquivos"
    backend_without_db: "nenhum atalho — a suíte usa o Postgres do compose (spring.docker.compose.skip.in-tests=false)"
  lint:
    configured: false
    effective_check: "tsc strict via npm run build (tsconfig: strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)"
  migrate:
    configured: true
    how: "Flyway no boot da aplicação (spring-boot-starter-flyway); migrações em db/migration; Hibernate só valida"
    baseline_on_migrate: true
  start_production:
    backend: "artefato do spring-boot-maven-plugin; comando de execução não documentado"
    frontend: "estático em dist/ gerado por vite build; hospedagem não declarada"
    status: "UNKNOWN"
ci_cd:
  github_actions: false
  dockerfile: false
  deploy_artifacts: "nenhum; apenas compose.yaml de desenvolvimento"
```

# 7. RESTRIÇÕES E FRONTEIRAS

```yaml
hard_limits:
  - {name: "MAX_PARTICIPANTS", value: 4, evidence: "service/implementation/SessionServiceImpl.java:47"}
  - {name: "MAX_SNAPSHOT_BYTES", value: 1000000, evidence: "service/implementation/SessionServiceImpl.java:50", reachable_over_ws: false}
  - {name: "WS_TEXT_FRAME_CEILING", value: "~8192 bytes (default do Tomcat, não configurado no projeto)", evidence: "SessionWebSocketTest#textFrameAboveTheContainerBufferClosesTheConnection"}
  - {name: "MAX_OPS_PER_MESSAGE (server)", value: 1000, evidence: "websocket/OperationValidator.java:36"}
  - {name: "MAX_OPS_PER_MESSAGE (client)", value: 1000, evidence: ".../collab/SyncEngine.ts:16"}
  - {name: "CHUNK_SIZE", value: 200, evidence: "websocket/SessionSocketHandler.java:57, .../collab/SyncEngine.ts:15"}
  - {name: "MAX_ID_LENGTH", value: 100, evidence: "websocket/OperationValidator.java:33"}
  - {name: "MAX_CHAT_LENGTH", value: 500, evidence: "websocket/SessionSocketHandler.java:59"}
  - {name: "MAX_VERSION_ENTRIES", value: 100, evidence: "websocket/SessionSocketHandler.java"}
  - {name: "MAX_PENDING_FRAMES (connection)", value: 1000, evidence: "websocket/SessionConnection.java"}
  - {name: "MAX_PENDING_FRAMES (client transport)", value: 500, evidence: ".../network/WebSocketTransport.ts:4"}
  - {name: "MAX_RECONNECT_ATTEMPTS", value: 5, evidence: ".../network/WebSocketTransport.ts:5"}
  - {name: "SNAPSHOT_INTERVAL_MS", value: 15000, evidence: "apps/design-editor/web/src/Main.tsx:37"}
  - {name: "confirmation token TTL", value: "24h", evidence: "service/implementation/UserServiceImpl.java"}
  - {name: "password length", value: "8..128", evidence: "controller/UserController.java:36-40"}
  - {name: "nickname length no registro", value: "3..32", evidence: "controller/UserController.java:42-46"}
```

```yaml
conventions:
  backend:
    - "Controller e WebSocket handler nunca acessam repository — agora por ArchUnit (ControllerLayeringTest.java:33-42)"
    - "Serviços expõem interface em service/ e implementação em service/implementation/"
    - "DTOs record para entrada; classes com factory estático from() para saída"
    - "Lombok: @Getter/@Setter/@RequiredArgsConstructor"
    - "Erros de domínio: EntityNotFoundException=404, IllegalArgumentException=400, IllegalStateException=409, AccessDeniedException=403"
    - "Ator sempre recebido por path ou body (userId/hostId), nunca derivado do SecurityContext (débito actor_identity_from_request, Fase 3)"
    - "Schema: qualquer mudança entra como nova migração Vn__*.sql; ddl-auto nunca volta a create/update"
  frontend:
    - "TypeScript strict, sem any implícito tolerado"
    - "Comunicação UI↔engine apenas via GLOBAL_BUS (EventBus)"
    - "Todo dispose é obrigatório porque React StrictMode monta duas vezes"
    - "Operação CRDT carrega resultado, não receita; JSON puro, sem classes three.js"
    - "Testes unitários em Vitest ao lado do código (*.test.ts); tsc strict também os verifica no build"
```

Fronteiras que o Agente Planejador não deve alterar sem autorização:

```yaml
boundaries:
  - id: "rest_contract"
    desc: "Rotas, verbos, status e shape de ApiErrorDto"
    status_fase0: "intacto"
  - id: "ws_protocol"
    desc: "Nomes dos tipos de mensagem e campos (sync_hello, sync_ops, presence, chat, scene_snapshot, sync_ack, session_roster, error)"
    status_fase0: "intacto e congelado por SessionWebSocketTest"
  - id: "op_schema"
    desc: "Formato {id:{siteId,lamport}, author, deps, kind, ...campos-do-kind}; validate.ts e OperationValidator mudam juntos"
    status_fase0: "intacto"
  - id: "db_schema"
    desc: "Nomes de tabelas/colunas e constraints de idempotência (uk_session_operation_seq, uk_session_operation_op, uk_session_participant)"
    status_fase0: "intacto; agora versionado em V1__baseline.sql"
  - id: "layering"
    desc: "Controller/WS → Service → Repository, verificado por ArchUnit"
  - id: "columns_legacy"
    desc: "sessions.user_id mantido como coluna do host; não renomear"
  - id: "single_instance"
    desc: "SessionConnectionRegistry é estado em memória; não introduzir escala horizontal sem broker"
```

# 8. STATUS E DÍVIDA TÉCNICA

```yaml
status:
  implemented:
    - {feature: "Registro com confirmação por e-mail", evidence: "controller/UserController.java:33, EmailConfirmationEndToEndTest.java"}
    - {feature: "Login/logout por sessão HTTP + CSRF", evidence: "controller/AuthController.java:40-63, config/SecurityConfig.java:69-80"}
    - {feature: "Bloqueio de login até email_verified", evidence: "service/implementation/UserDetailsServiceImpl.java:34"}
    - {feature: "CRUD de usuário", evidence: "controller/UserControllerTest.java (16 @Test)"}
    - {feature: "Pedidos de amizade e lista/remoção", evidence: "controller/FriendRequestControllerTest.java (11 @Test)"}
    - {feature: "Ciclo de sala", evidence: "controller/SessionControllerTest.java (9 @Test)"}
    - {feature: "Ordem total, dedupe e persistência de operações", evidence: "SessionServiceImpl.java:232-270"}
    - {feature: "WebSocket colaborativo: handshake, catch-up, relay, roster, acks", evidence: "websocket/SessionWebSocketTest.java (9 @Test)"}
    - {feature: "Snapshot de cena (escrita/leitura) até o limite do transporte", evidence: "SessionWebSocketTest#snapshotFrameIsStoredAndAMissingOneIsRejected"}
    - {feature: "CRDT cliente (LWW + tombstones + replay)", evidence: ".../collab/DocumentState.ts:33; testes em .../collab/DocumentState.test.ts"}
    - {feature: "Primitivas, transform gizmo, cor, exclusão, undo/redo local", evidence: ".../command/implementation"}
    - {feature: "Presença e selection advisory lock", evidence: ".../collab/PresenceService.ts:17"}
    - {feature: "Chat de sessão (efêmero)", evidence: ".../react/ui/ChatPanel.tsx"}
    - {feature: "Import .obj e export .obj (local)", evidence: ".../core/ObjectParser.ts, .../core/utils/FileExporter.ts"}
  partial:
    - {feature: "Timeline scrubber", gap: "replay só conta objetos; não reconstrói cena 3D histórica"}
    - {feature: "scene_snapshot como reidratação", gap: "nenhum fromSnapshot; e o frame não cabe acima de ~8 KB"}
    - {feature: "Presença online fora de sessão", gap: "amigo aparece apenas hosting ou offline"}
    - {feature: "Cobertura de testes do frontend", gap: "só o CRDT tem testes unitários; engine e UI não têm"}
  stub_or_dead:
    - {feature: "mesh_edit e undo como operações CRDT", state: "declaradas em Operation.ts e rejeitadas por validate.ts e OperationValidator (default false)"}
    - {feature: "AddObjectCommand", state: "dead code, caminho local não instanciado"}
    - {feature: "SessionService.syncSinceSeq", state: "implementado, sem chamador no handler WebSocket"}
    - {feature: "SessionParticipantRepository.deleteBySessionIdAndUserId", state: "declarado sem uso detectado"}
  unknown:
    - {item: "Comportamento em produção", reason: "sem Dockerfile, CI ou configuração de deploy"}
```

```yaml
technical_debt:
  resolved_in_phase0:
    - {id: "ddl_auto_destructive", how: "Flyway V1__baseline.sql + ddl-auto=validate (P0.5)"}
    - {id: "duplicate_root_package", how: "npm workspaces; deps duplicadas removidas do package.json raiz (P0.6)"}
    - {id: "mixed_jackson_packages", how: "verificado: não é débito — Jackson 3 mantém as anotações em com.fasterxml.jackson.annotation (jackson-annotations 2.21 transitivo); P0.1 §2.4"}
  partially_resolved:
    - {id: "no_frontend_tests", state: "existe runner (Vitest) e 29 testes de CRDT; engine/UI continuam sem testes"}
  open:
    - {id: "actor_identity_from_request", desc: "userId/hostId vêm de path/body/query sem verificação contra o principal autenticado", phase: "P3.1"}
    - {id: "no_ci", desc: "ausência de pipeline, Dockerfile ou script de deploy", phase: "P3.4"}
    - {id: "in_memory_registry", desc: "SessionConnectionRegistry impede escala horizontal", phase: "P3.4"}
    - {id: "linear_scans", desc: "syncSince e syncSinceSeq carregam o log inteiro e filtram em memória", phase: "P1.12"}
    - {id: "user_enumeration", desc: "GET /users lista todos; busca de amigo por nickname no cliente", phase: "P3.4"}
    - {id: "hardcoded_dev_credentials", desc: "senha do Postgres literal em compose.yaml versionado", phase: "P3.4"}
    - {id: "stale_package_description", desc: "description do pacote web referencia 'npx serve src/'", phase: "P3.4"}
    - {id: "oauth2_starter_unused", desc: "spring-boot-starter-security-oauth2-client sem configuração de client", phase: "P3.2"}
    - {id: "doc_code_drift", desc: "README aponta para docs/backend-architecture.md e docs/frontend-architecture.md (removidos em 9fbbf44)", phase: "P3.4"}
    - {id: "ws_frame_limit_8kb", desc: "frames de texto acima de ~8 KB fecham a conexão (1009); SNAPSHOT_TOO_LARGE (1 MB) é inalcançável pela rede e qualquer scene_snapshot real derruba o socket", evidence: "SessionWebSocketTest#textFrameAboveTheContainerBufferClosesTheConnection; docs/refactor-notes.md §2.5", phase: "P1.3 (propriedade) / pré-requisito de P3.3"}
    - {id: "flyway_baseline_silent_adoption", desc: "baseline-on-migrate=true adota base existente sem validar drift (necessário porque a base de dev/teste já existia)", phase: "revisar em P1.10"}
    - {id: "crdt_revive_ignores_color", desc: "add_object que revive um objeto apagado atualiza transform/addStamp mas não color", evidence: "apps/design-editor/web/src/collab/DocumentState.test.ts", phase: "P2.3"}
    - {id: "crdt_change_reported_by_stamp", desc: "LWWRegister compara carimbos: um write que vence reporta mudança mesmo com valor idêntico", evidence: "apps/design-editor/web/src/collab/DocumentState.test.ts", phase: "P2.3"}
```

# 9. DELTA EM RELAÇÃO À VERSÃO ANTERIOR

Comparação com `architecture-v0.0-baseline.md` (commit `90b48ff`, estado de `1c03688`).

## 9.1 Adicionado

| Caminho | O quê |
|---|---|
| `docs/architecture/` | Histórico imutável: `architecture-v0.0-baseline.md`, `architecture-v0.1-fase0-preparacao.md`, `legacy/backend-architecture-v0.0.md`, `legacy/frontend-architecture-v0.0.md`, índice `README.md` |
| `docs/refactor-notes.md` | Premissas do §0.4 e pontos do §11 verificados, divergências, decisões, pendências |
| `backend/blenderpds/src/main/resources/db/migration/V1__baseline.sql` | Baseline do schema (163 linhas) gerado por `pg_dump` |
| `backend/blenderpds/src/test/java/com/grupo03/blenderpds/controller/ControllerLayeringTest.java` (reescrito) | Regras ArchUnit: `..controller..`/`..websocket..` não dependem de `..repository..` |
| `backend/blenderpds/src/test/java/com/grupo03/blenderpds/websocket/SessionWebSocketTest.java` (+4 testes) | Caracterização: round trip, UNKNOWN_TYPE/INVALID_MESSAGE, snapshot, limite de frame |
| `apps/design-editor/web/src/collab/{LamportClock,OpLog,LWWRegister,DocumentState}.test.ts` | 29 testes unitários do CRDT |
| `apps/design-editor/web/vitest.config.ts` | Configuração do Vitest (environment node, `src/**/*.test.ts`) |
| `package.json` (raiz) | Workspace root (`private: true`, `workspaces: ["apps/*/web"]`, engines) |

Dependências novas: `spring-boot-starter-flyway`, `org.flywaydb:flyway-database-postgresql`
(runtime), `com.tngtech.archunit:archunit:1.4.1` (test), `vitest@^5.1.0` (dev).

## 9.2 Movido

| De | Para | Como |
|---|---|---|
| `frontend/` (SPA inteiro) | `apps/design-editor/web/` | `git mv` (histórico preservado) |
| `docs/architecture-manifest.md` | `docs/architecture/architecture-v0.0-baseline.md` | `git mv` + cabeçalho YAML (conteúdo intacto) |
| `docs/backend-architecture.md`, `docs/frontend-architecture.md` (removidos em `9fbbf44`) | `docs/architecture/legacy/*-v0.0.md` | restaurados de `1c03688` |

## 9.3 Removido

- `package.json` (raiz): dependências duplicadas `react`, `react-dom`, `react-router-dom`, `@types/node`.
- `application.properties`: `spring.jpa.hibernate.ddl-auto=create` (substituído por `validate`).
- `ControllerLayeringTest`: verificação por reflexão sobre campos de controller (substituída por ArchUnit,
  que enxerga o corpo dos métodos e o pacote `websocket`).

## 9.4 Alterado

| Caminho | Alteração |
|---|---|
| `backend/blenderpds/pom.xml` | Flyway (starter + módulo Postgres) e ArchUnit (test) |
| `backend/blenderpds/src/main/resources/application.properties` | `ddl-auto=validate`; `spring.flyway.baseline-on-migrate=true` |
| `apps/design-editor/web/package.json` | scripts `vite`/`tsc` sem prefixo `node_modules/.bin/`; novo script `test` |
| `README.md`, `apps/design-editor/web/README.md` | comandos e caminhos do workspace; Vitest documentado |
| `docs/plano-framework-collab3d-completo.md` | referência ao manifesto aponta para o novo caminho |

## 9.5 Dívidas técnicas resolvidas (ids do manifesto v0.0)

- `ddl_auto_destructive` — **resolvida**: Flyway + `validate`, verificado em banco limpo.
- `duplicate_root_package` — **resolvida**: npm workspaces, raiz sem dependências.
- `mixed_jackson_packages` — **encerrada por evidência**: não era débito (anotações permanecem em
  `com.fasterxml.jackson.annotation` no Jackson 3).
- `no_frontend_tests` — **parcialmente resolvida**: Vitest com 29 testes de CRDT.

## 9.6 Dívidas técnicas novas

- `ws_frame_limit_8kb` — o transporte corta em ~8 KB e o `SNAPSHOT_TOO_LARGE` de 1 MB nunca é
  alcançável; `scene_snapshot` real derruba o socket.
- `flyway_baseline_silent_adoption` — a base de dev/teste foi adotada como baseline (V1 não
  reexecutada nela).
- `crdt_revive_ignores_color` e `crdt_change_reported_by_stamp` — comportamentos congelados pelos
  testes de caracterização que precisam de decisão em P2.3.
- `dependency_probing` (metodológico) — a base de dev/teste e o compose são persistentes/start-and-stop,
  então verificar "banco limpo" exige um banco descartável e `--spring.docker.compose.enabled=false`.

## 9.7 Contratos (REST / WS / schema de operações / banco)

| Contrato | Mudança | Tipo |
|---|---|---|
| REST | nenhuma rota, verbo, status ou shape alterado | — |
| WebSocket | nenhum tipo/campo alterado; apenas **caracterizado** por testes (roster após o 1º `sync_hello`; teto de ~8 KB por frame) | — (comportamento documentado, não alterado) |
| Schema de operações | nenhum campo alterado; confirmado que os campos do `kind` vivem no envelope | — |
| Banco de dados | mesmas tabelas/colunas/constraints; agora criadas por `V1__baseline.sql` e validadas por Hibernate | **aditiva em processo** (schema idêntico, migração versionada) |

Nenhuma mudança quebra a aplicação atual (regra §0.5 preservada): o editor continua falando o
mesmo REST, o mesmo WebSocket e o mesmo schema de operações.
