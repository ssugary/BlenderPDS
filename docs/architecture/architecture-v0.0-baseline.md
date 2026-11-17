---
version: "0.0"
phase: "baseline"
commit_sha: "90b48ff6c1f694bc42a3a8a89428bb52af2c7780"
date: "2026-11-17"
previous_version: null
scope: "Snapshot completo do repositorio ANTES da refatoracao para o framework collab3d: backend Spring Boot 4.1.1 em backend/blenderpds, SPA React/three.js em frontend/, docs/ e package.json da raiz. Conteudo herdado de docs/architecture-manifest.md (varredura do commit 1c03688) sem alteracao."
---

> **Origem:** este arquivo e o antigo `docs/architecture-manifest.md`, movido com `git mv`
> em 2026-11-17 (tarefa P0.0 da Fase 0) **sem alteracao de conteudo**. O bloco `meta`
> abaixo e o original da varredura e aponta `commit_sha: 1c03688` — o commit varrido.
> Este snapshot descreve o estado anterior a refatoracao; o cabecalho YAML acima registra
> o HEAD no momento em que o snapshot foi versionado.
> Documentos legados do mesmo estado: `docs/architecture/legacy/backend-architecture-v0.0.md`
> e `docs/architecture/legacy/frontend-architecture-v0.0.md`.

```yaml
meta:
  commit_sha: 1c036886f969269212eff123298042a2ac542536
  branch: main
  scanned_at: "2026-11-16T14:05:00-03:00"
  scan_scope:
    - "backend/blenderpds/pom.xml"
    - "backend/blenderpds/compose.yaml"
    - "backend/blenderpds/src/main/java"
    - "backend/blenderpds/src/main/resources/application.properties"
    - "backend/blenderpds/src/test/java"
    - "frontend/package.json"
    - "frontend/vite.config.ts"
    - "frontend/tsconfig.json"
    - "frontend/index.html"
    - "frontend/src"
    - "docs"
    - "README.md"
    - "package.json"
  excluded_paths:
    - "node_modules/"
    - "dist/"
    - "build/"
    - "vendor/"
    - ".git/"
    - "coverage/"
    - ".freebuff/"
    - ".idea/"
    - "*.min.*"
    - "binários e artefatos gerados"
  confidence: high
  truncated: false
  truncation_reason: null
  token_budget: 9000
```

# 1. SYSTEM OVERVIEW

Editor 3D de modelagem em navegador com edição colaborativa em tempo real. O frontend SPA (React + three.js) mantém a cena como projeção de um log de operações CRDT; o backend Spring Boot persiste contas, amizades, salas e o log de operações, atuando como sequenciador global (atribui `seq`, deduplica) sem interpretar o CRDT. Evidência: `README.md`, `docs/backend-architecture.md`, `docs/frontend-architecture.md`.

```yaml
stack:
  backend:
    language: "Java 21"
    evidence: "backend/blenderpds/pom.xml:30"
    framework: "Spring Boot 4.1.1 (parent)"
    evidence: "backend/blenderpds/pom.xml:8"
    modules:
      - {name: "spring-boot-starter-webmvc", evidence: "backend/blenderpds/pom.xml:55"}
      - {name: "spring-boot-starter-data-jpa", evidence: "backend/blenderpds/pom.xml:39"}
      - {name: "spring-boot-starter-security", evidence: "backend/blenderpds/pom.xml:43"}
      - {name: "spring-boot-starter-security-oauth2-client", evidence: "backend/blenderpds/pom.xml:47", used: false}
      - {name: "spring-boot-starter-websocket", evidence: "backend/blenderpds/pom.xml:59"}
      - {name: "spring-boot-starter-mail", evidence: "backend/blenderpds/pom.xml:63"}
      - {name: "spring-boot-starter-validation", evidence: "backend/blenderpds/pom.xml:51"}
      - {name: "spring-boot-starter-actuator", evidence: "backend/blenderpds/pom.xml:35"}
      - {name: "spring-boot-docker-compose", evidence: "backend/blenderpds/pom.xml", scope: "runtime"}
      - {name: "lombok", evidence: "backend/blenderpds/pom.xml:85"}
      - {name: "org.postgresql:postgresql", evidence: "backend/blenderpds/pom.xml:80", scope: "runtime"}
    json: "Jackson 3 (tools.jackson) — backend/blenderpds/src/main/java/com/grupo03/blenderpds/websocket/SessionSocketHandler.java"
    build: "Maven Wrapper 3.10.0 — backend/blenderpds/.mvn/wrapper/maven-wrapper.properties"
  frontend:
    language: "TypeScript 7.0.2 (strict)"
    evidence: "frontend/package.json:27, frontend/tsconfig.json"
    framework: "React 19.3.0"
    evidence: "frontend/package.json:17"
    router: "react-router-dom 7.18.x"
    evidence: "frontend/package.json"
    3d: "three 0.161.x"
    evidence: "frontend/package.json:20"
    bundler: "Vite 8.3.x + @vitejs/plugin-react"
    evidence: "frontend/package.json:28, frontend/vite.config.ts"
    css: "lightningcss 1.33.x"
    evidence: "frontend/package.json"
    node_engine: "^20.19.0 || >=22.12.0"
    evidence: "frontend/package.json:7"
  data:
    engine: "PostgreSQL 16"
    evidence: "backend/blenderpds/compose.yaml"
    orm: "Spring Data JPA / Hibernate"
    evidence: "backend/blenderpds/src/main/resources/application.properties:8"
  mail:
    dev: "Mailpit (SMTP 1025, UI 8025)"
    evidence: "backend/blenderpds/compose.yaml"
```

# 2. DIRECTORY & ARCHITECTURE MAP

```yaml
directories:
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
  - path: "backend/blenderpds/src/test/java"
    responsibility: "16 classes de teste, 116 métodos @Test (controllers, services, repositories, model mapping, WebSocket)"
  - path: "frontend/src/api"
    responsibility: "Cliente REST + CSRF (Backend.ts)"
  - path: "frontend/src/collab"
    responsibility: "CRDT: Operation, OpId, LamportClock, OpLog, DocumentState, LWWRegister, ReplicaSession, SyncEngine, SceneProjector, SceneSnapshot, PresenceService, RemoteSelectionView, validate.ts"
  - path: "frontend/src/core"
    responsibility: "Composition root (Engine.ts), EventBus, RenderEngine, ObjectParser, controllers (ActionRouter, SelectionController, TransformGestureController), utils (FileExporter, FileLoader, Id)"
  - path: "frontend/src/entity"
    responsibility: "EditorMode, SelectionStrategy, HalfEdge (malha half-edge), Navigation"
  - path: "frontend/src/manager"
    responsibility: "SceneManager, CameraManager, SelectionManager, RaycasterManager, ToolManager, CommandManager, EditorModeManager, InputManager"
  - path: "frontend/src/tool"
    responsibility: "Tool base + TransformTool, CreateObjectTool, DeleteTool, MeshEditTool"
  - path: "frontend/src/command"
    responsibility: "Command base + CreatePrimitiveCommand, DeleteObjectCommand, ColorEditCommand, TransformCommand, MeshEditCommand, FaceExtrudeCommand, AddObjectCommand"
  - path: "frontend/src/network"
    responsibility: "Transport (interface), WebSocketTransport, Session (role/transport/sessionId/userId)"
  - path: "frontend/src/react"
    responsibility: "Viewport3D + UI: AppRoutes, Lobby, MenuPage, HostPage, JoinPage, SocialPage, SocialContext, UseSocial, FriendsPanel, ChatPanel, TimelinePanel, Toolbar, ColorPicker, EditorOverlay, Toast"
  - path: "docs"
    responsibility: "Documentação de arquitetura backend/frontend (contém diagramas Mermaid) e este manifesto"
  - path: "backend/blenderpds/compose.yaml"
    responsibility: "Postgres 16 + Mailpit para desenvolvimento e testes"
```

Padrão arquitetural backend: **Layered / Ports-and-Adapters leve**. Controladores e handler WebSocket chamam apenas interfaces de serviço; serviços não conhecem HTTP nem sockets; persistência isolada em repositories Spring Data. Evidências: `backend/blenderpds/src/main/java/com/grupo03/blenderpds/controller/SessionController.java:30-35`, `backend/blenderpds/src/main/java/com/grupo03/blenderpds/websocket/SessionSocketHandler.java`, `backend/blenderpds/src/test/java/com/grupo03/blenderpds/controller/ControllerLayeringTest.java`, `docs/backend-architecture.md`.

Padrão arquitetural frontend: **Composition Root + Managers/Controllers/Tools/Commands + EventBus global + CRDT client-side**. Evidências: `frontend/src/core/Engine.ts:40`, `frontend/src/core/controllers/ActionRouter.ts`, `frontend/src/core/EventBus.ts`, `frontend/src/collab/DocumentState.ts:33`.

# 3. DATA & STATE MODEL

```yaml
database:
  engine: "PostgreSQL 16"
  schema_management: "spring.jpa.hibernate.ddl-auto=create"
  schema_evidence: "backend/blenderpds/src/main/resources/application.properties:8"
  migrations:
    present: false
    evidence: "ausência de db/migration ou de configuração Flyway/Liquibase em git ls-files"
    status: "UNKNOWN — sem ferramenta de migração; schema recriado pelo Hibernate a cada start"
  warning: "docs/backend-architecture.md afirma ddl-auto=update; application.properties:8 define create. Divergência não resolvida."

tables:
  users:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/User.java:41,48"
    columns:
      id: "IDENTITY"
      nickname: "varchar(50) not null"
      email: "varchar(100) not null unique (username de login)"
      password_hash: "varchar(100) not null (hash do DelegatingPasswordEncoder)"
      role: "enum string USER|ADMIN"
      email_verified: "boolean not null default false"
      created_at: "timestamp (@CreatedDate)"
    relationships:
      - "friendList: @ManyToMany self via user_friends(user_id, friend_id) — model/User.java"
  friend_requests:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/FriendRequest.java:32,39"
    columns: {id: "IDENTITY", sender_id: "FK users", receiver_id: "FK users", created_at: "timestamp"}
    constraints: ["uk_friend_request_pair (sender_id, receiver_id)"]
    lifecycle: "linha apagada em accept/reject/cancel"
  sessions:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/Session.java:39,46"
    columns:
      id: "IDENTITY"
      user_id: "FK users (host); nome mantido por compatibilidade de schema"
      status: "enum string WAITING|ACTIVE|ENDED"
      code: "varchar(12) not null unique (10 chars gerados)"
      scene_snapshot: "text (JSON opaco, denormalização)"
      created_at: "timestamp"
      updated_at: "timestamp (@LastModifiedDate)"
      ended_at: "timestamp nullable"
  session_participants:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/SessionParticipant.java:33,41"
    columns: {id: "IDENTITY", session_id: "FK sessions", user_id: "FK users", active: "boolean", joined_at: "timestamp", last_seen_at: "timestamp"}
    constraints: ["uk_session_participant (session_id, user_id)"]
  session_operations:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/SessionOperation.java:42,52"
    columns:
      id: "IDENTITY"
      session_id: "FK sessions not null"
      seq: "bigint not null (ordem total do servidor)"
      site_id: "varchar(100) not null (réplica Lamport)"
      lamport: "bigint not null"
      author_id: "FK users nullable (detachAuthor em delete)"
      kind: "varchar(32) not null (add_object|remove_object|set_transform|change_color)"
      payload: "text not null (JSON bruto do cliente)"
      created_at: "timestamp"
    constraints:
      - "uk_session_operation_seq (session_id, seq)"
      - "uk_session_operation_op (session_id, site_id, lamport)"
  email_confirm_tokens:
    entity: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/EmailConfirmationToken.java:25,31"
    columns: {id: "IDENTITY", token: "varchar(64) not null unique (UUID)", user_id: "FK users", expires_at: "timestamp"}
    ttl: "24h — UserServiceImpl.CONFIRM_TOKEN_TTL"

enums:
  Role: {values: [USER, ADMIN], evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/Role.java:6"}
  SessionStatus: {values: [WAITING, ACTIVE, ENDED], evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/model/SessionStatus.java:15"}

queries_relevant:
  - {name: "UserRepository.areFriends", query: "JPQL join friendList", evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository/UserRepository.java:25"}
  - {name: "SessionRepository.findOpenByHostIds", query: "join fetch host where status=:status", evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository/SessionRepository.java:28"}
  - {name: "SessionRepository.findByIdForUpdate", lock: "PESSIMISTIC_WRITE", evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository/SessionRepository.java:35"}
  - {name: "SessionOperationRepository.detachAuthor", query: "update ... set author=null", evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository/SessionOperationRepository.java:32"}
  - {name: "SessionParticipantRepository.findBySessionIdOrderByJoinedAtAsc", query: "join fetch user", evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/repository/SessionParticipantRepository.java:23"}

frontend_state:
  document_model:
    - {piece: "ReplicaSession", role: "clock+log+state por réplica", evidence: "frontend/src/collab/ReplicaSession.ts:13-15,26,41"}
    - {piece: "OpLog", role: "lista append-only + versionVector + dedupe por OpId", evidence: "frontend/src/collab/OpLog.ts:11"}
    - {piece: "DocumentState", role: "CRDT: LWWRegister em transform/color, addStamp/removeStamp como tombstones; apply() devolve Change[]; replay() reconstrói prefixo", evidence: "frontend/src/collab/DocumentState.ts:33"}
    - {piece: "LWWRegister", role: "register por campo com desempate por OpId", evidence: "frontend/src/collab/LWWRegister.ts"}
    - {piece: "SceneProjector", role: "único escritor de conteúdo compartilhado no SceneManager; mapa objectId↔Mesh", evidence: "frontend/src/collab/SceneProjector.ts:14"}
    - {piece: "PresenceService", role: "estado efêmero de seleção e lock, fora do OpLog", evidence: "frontend/src/collab/PresenceService.ts:17"}
  persistence_client:
    - {key: "blenderpds:user", store: "localStorage", content: "usuário autenticado (sem token)", evidence: "frontend/src/react/ui/UseSocial.ts:71,78,96,98"}
  ui_state: "React useState/useMemo por tela; nenhuma store global (zustand/redux ausente em frontend/package.json)"
```

# 4. ENTRY POINTS & DATA FLOWS

```yaml
entry_points:
  backend:
    file: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/BlenderpdsApplication.java"
    symbol: "main(String[] args)"
    annotation: "@SpringBootApplication"
    port: "8080 (default Spring Boot; README.md)"
  backend_websocket:
    path: "/ws/sessions/*"
    evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/config/WebSocketConfig.java:35"
    handshake: "SessionHandshakeInterceptor.beforeHandshake"
    handler: "SessionSocketHandler"
  frontend:
    html: "frontend/index.html:13"
    script: "/src/Main.tsx"
    react_root: "frontend/src/Main.tsx:144"
    routes_root: "frontend/src/react/ui/AppRoutes.tsx:122-126"
```

Rotas REST (todas sob `authenticated()` exceto as quatro públicas em `SecurityConfig.java:69-73`):

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
  - {note: "Frontend chama /api/<path>; Vite remove o prefixo", evidence: "frontend/vite.config.ts:22, frontend/src/api/Backend.ts:14"}
```

Protocolo WebSocket:

```yaml
ws_protocol:
  url: "ws(s)://<host>/ws/sessions/{sessionId}?userId={userId}"
  url_builder: "frontend/src/network/WebSocketTransport.ts:52"
  gate: "SessionHandshakeInterceptor.beforeHandshake → SessionService.connectParticipant (404/403/409 como status HTTP)"
  client_to_server:
    - {type: "sync_hello", payload: "{vv: VersionVector}", handler: "SessionSocketHandler.handleHello", evidence: "websocket/SessionSocketHandler.java:94,133"}
    - {type: "sync_ops", payload: "{ops: Operation[]}", handler: "SessionSocketHandler.handleOps", evidence: "websocket/SessionSocketHandler.java:95,157"}
    - {type: "presence", payload: "{siteId, selectedObjectId}", handler: "SessionSocketHandler.relayPresence", evidence: "websocket/SessionSocketHandler.java:96,192"}
    - {type: "chat", payload: "{text}", handler: "SessionSocketHandler.relayChat", evidence: "websocket/SessionSocketHandler.java:97,212"}
    - {type: "scene_snapshot", payload: "{snapshot}", handler: "SessionSocketHandler.handleSnapshot", evidence: "websocket/SessionSocketHandler.java:98,230"}
  server_to_client:
    - {type: "sync_ops", note: "catch-up e relay; operações carregam seq", evidence: "websocket/SessionSocketHandler.java:133-145"}
    - {type: "sync_ack", note: "{siteId, lamport, seq}", evidence: "websocket/SessionSocketHandler.java"}
    - {type: "session_roster", note: "{sessionId, status, participants[]}", evidence: "websocket/SessionSocketHandler.java:248"}
    - {type: "presence", note: "somente relay"}
    - {type: "chat", note: "somente relay, sem persistência"}
    - {type: "error", note: "{code} em UNKNOWN_TYPE|INVALID_MESSAGE|INTERNAL_ERROR|INVALID_OP|OP_REJECTED|SYNC_FAILED|INVALID_SNAPSHOT|SNAPSHOT_TOO_LARGE|SNAPSHOT_REJECTED"}
  ordering_guarantee: "persistência e relay dentro do lock por sessão (SessionConnectionRegistry.runLocked)"
  evidence: "backend/blenderpds/src/main/java/com/grupo03/blenderpds/websocket/SessionConnectionRegistry.java"
```

Fluxo REST: `Controller → Service(interface) → ServiceImpl(@Transactional) → Repository(Spring Data) → PostgreSQL`, com exceções mapeadas por `ApiExceptionHandler` para `ApiErrorDto{status,error,message}`. Evidências: `controller/SessionController.java:38-42`, `service/implementation/SessionServiceImpl.java:232`, `controller/ApiExceptionHandler.java`, `dto/ApiErrorDto.java:11`.

```yaml
flows:
  - {from: "Toolbar/Keyboard/Gizmo", to: "ActionRouter", via: "eventos GLOBAL_BUS", evidence: "frontend/src/core/controllers/ActionRouter.ts"}
  - {from: "ActionRouter", to: "CommandManager", via: "execute(Command)", evidence: "frontend/src/core/controllers/ActionRouter.ts"}
  - {from: "Command", to: "ReplicaSession", via: "commit(NewOperation)", evidence: "frontend/src/command/implementation/CreatePrimitiveCommand.ts:33"}
  - {from: "ReplicaSession", to: "DocumentState", via: "state.apply(op) → Change[]", evidence: "frontend/src/collab/ReplicaSession.ts:26"}
  - {from: "ReplicaSession", to: "SyncEngine", via: "onLocalOp", evidence: "frontend/src/collab/SyncEngine.ts:37,67"}
  - {from: "SyncEngine", to: "WebSocketTransport", via: "send({type:'sync_ops'})", evidence: "frontend/src/collab/SyncEngine.ts"}
  - {from: "WebSocketTransport", to: "SessionSocketHandler", via: "frame JSON", evidence: "frontend/src/network/WebSocketTransport.ts"}
  - {from: "SessionSocketHandler", to: "OperationValidator", via: "validateBatch", evidence: "websocket/SessionSocketHandler.java:158"}
  - {from: "SessionSocketHandler", to: "SessionServiceImpl.appendOperations", via: "chamada de serviço sob lock", evidence: "websocket/SessionSocketHandler.java:167"}
  - {from: "SessionServiceImpl.appendOperations", to: "SessionOperationRepository", via: "existsBy/save", evidence: "service/implementation/SessionServiceImpl.java:232-270"}
  - {from: "SessionSocketHandler", to: "SessionConnectionRegistry.broadcast", via: "frame sync_ops", evidence: "websocket/SessionSocketHandler.java:180"}
  - {from: "ReplicaSession", to: "SceneProjector", via: "onChange(Change[])", evidence: "frontend/src/collab/SceneProjector.ts:14-30"}
  - {from: "SessionServiceImpl.endSession", to: "SessionSocketHandler.onSessionEnded", via: "SessionEndedEvent com @TransactionalEventListener(AFTER_COMMIT) → closeAll", evidence: "service/implementation/SessionServiceImpl.java:200, websocket/SessionSocketHandler.java:123"}
```

# 5. EXTERNAL DEPENDENCIES & INTEGRATIONS

```yaml
integrations:
  - name: "PostgreSQL 16"
    type: "database"
    config: "backend/blenderpds/compose.yaml (serviço postgres, volume blenderpds-data)"
    injected_by: "spring-boot-docker-compose (backend/blenderpds/pom.xml)"
  - name: "Mailpit (SMTP de desenvolvimento)"
    type: "email"
    config: "backend/blenderpds/compose.yaml; SMTP 1025, UI 8025"
    client: "JavaMailSender / spring-boot-starter-mail — backend/blenderpds/src/main/java/com/grupo03/blenderpds/service/implementation/EmailServiceImpl.java"
  - name: "SMTP genérico"
    type: "email"
    config: "spring.mail.* em application.properties:12-22"
  - name: "Vite dev proxy"
    type: "http/ws proxy"
    config: "'/api' com rewrite e '/ws' com ws:true apontando para BACKEND_URL"
    evidence: "frontend/vite.config.ts:22,28"
  - name: "APIs externas de terceiros"
    type: "UNKNOWN"
    note: "nenhum SDK ou HTTP client externo encontrado em pom.xml ou frontend/package.json"
  - name: "Filas / brokers"
    type: "absent"
    note: "relay em memória via SessionConnectionRegistry — backend single-instance"
```

Variáveis de ambiente (apenas chaves):

```yaml
env_vars:
  backend:
    - {key: "MAIL_HOST", default_present: true, evidence: "application.properties:12"}
    - {key: "MAIL_PORT", default_present: true, evidence: "application.properties:13"}
    - {key: "MAIL_USERNAME", default_present: true, evidence: "application.properties"}
    - {key: "MAIL_PASSWORD", default_present: true, evidence: "application.properties"}
    - {key: "MAIL_SMTP_AUTH", default_present: true, evidence: "application.properties"}
    - {key: "MAIL_SMTP_STARTTLS", default_present: true, evidence: "application.properties"}
    - {key: "MAIL_FROM", default_present: true, evidence: "application.properties:24"}
    - {key: "APP_BASE_URL", default_present: true, evidence: "application.properties:25"}
    - {key: "WS_ALLOWED_ORIGINS", default_present: true, evidence: "application.properties:32"}
    - {key: "POSTGRES_DB", evidence: "backend/blenderpds/compose.yaml"}
    - {key: "POSTGRES_USER", evidence: "backend/blenderpds/compose.yaml"}
    - {key: "POSTGRES_PASSWORD", evidence: "backend/blenderpds/compose.yaml", note: "valor literal versionado no compose; segredo de desenvolvimento, não reproduzido aqui"}
  frontend:
    - {key: "BACKEND_URL", default: "http://localhost:8080", evidence: "frontend/vite.config.ts:5"}
  runtime_injected_by_spring:
    - {key: "SPRING_DATASOURCE_*", note: "preenchido pela integração docker-compose; nomes não declarados no repositório", status: "UNKNOWN"}
```

# 6. OPERATIONAL COMMANDS

```yaml
commands:
  install:
    frontend: "cd frontend && npm install"
    backend: "sem passo explícito — Maven Wrapper resolve dependências no primeiro build (backend/blenderpds/mvnw)"
    evidence: "README.md"
  dev:
    backend: "cd backend/blenderpds && ./mvnw spring-boot:run"
    backend_side_effects: "Spring Boot Docker Compose sobe postgres e mailpit automaticamente"
    frontend: "cd frontend && npm run dev"
    frontend_port: 5173
    evidence: "frontend/package.json:11, frontend/vite.config.ts:17, README.md"
  build:
    frontend: "cd frontend && npm run build"
    build_impl: "node_modules/.bin/tsc && vite build (typecheck strict + bundle)"
    evidence: "frontend/package.json:12"
  preview:
    frontend: "cd frontend && npm run preview"
    evidence: "frontend/package.json:13"
  test:
    backend: "cd backend/blenderpds && ./mvnw test"
    requirement: "Docker ativo (Postgres de compose.yaml; Mailpit para EmailConfirmationEndToEndTest) — application.properties:5, README.md"
    frontend: "NONE — nenhum runner de teste configurado"
  lint:
    configured: false
    effective_check: "tsc strict via npm run build (frontend/tsconfig.json: strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)"
  migrate:
    configured: false
    actual: "Hibernate ddl-auto=create em application.properties:8"
  start_production:
    backend: "artefato do spring-boot-maven-plugin (backend/blenderpds/pom.xml:129); comando de execução não documentado"
    frontend: "estático em dist/ gerado por vite build; hospedagem não declarada"
    status: "UNKNOWN"
ci_cd:
  github_actions: false
  evidence: "ausência de .github/ em git ls-files"
  dockerfile: false
  evidence: "ausência de Dockerfile em git ls-files"
  deploy_artifacts: "nenhum; apenas compose.yaml de desenvolvimento"
```

# 7. TECHNICAL CONSTRAINTS & BOUNDARIES

```yaml
hard_limits:
  - {name: "MAX_PARTICIPANTS", value: 4, evidence: "service/implementation/SessionServiceImpl.java:47"}
  - {name: "MAX_SNAPSHOT_BYTES", value: 1000000, evidence: "service/implementation/SessionServiceImpl.java:50"}
  - {name: "MAX_OPS_PER_MESSAGE (server)", value: 1000, evidence: "websocket/OperationValidator.java:36"}
  - {name: "MAX_OPS_PER_MESSAGE (client)", value: 1000, evidence: "frontend/src/collab/SyncEngine.ts:16"}
  - {name: "CHUNK_SIZE", value: 200, evidence: "websocket/SessionSocketHandler.java:57, frontend/src/collab/SyncEngine.ts:15"}
  - {name: "MAX_ID_LENGTH", value: 100, evidence: "websocket/OperationValidator.java:33"}
  - {name: "MAX_CHAT_LENGTH", value: 500, evidence: "websocket/SessionSocketHandler.java:59"}
  - {name: "MAX_VERSION_ENTRIES", value: 100, evidence: "websocket/SessionSocketHandler.java"}
  - {name: "MAX_PENDING_FRAMES (connection)", value: 1000, evidence: "websocket/SessionConnection.java"}
  - {name: "MAX_PENDING_FRAMES (client transport)", value: 500, evidence: "frontend/src/network/WebSocketTransport.ts:4"}
  - {name: "MAX_RECONNECT_ATTEMPTS", value: 5, evidence: "frontend/src/network/WebSocketTransport.ts:5"}
  - {name: "SNAPSHOT_INTERVAL_MS", value: 15000, evidence: "frontend/src/Main.tsx:37"}
  - {name: "session code", value: "10 chars do UUID, 5 tentativas", evidence: "service/implementation/SessionServiceImpl.java:357"}
  - {name: "confirmation token TTL", value: "24h", evidence: "service/implementation/UserServiceImpl.java"}
  - {name: "password length", value: "8..128", evidence: "controller/UserController.java:36-40"}
  - {name: "nickname length no registro", value: "3..32", evidence: "controller/UserController.java:42-46"}
```

```yaml
conventions:
  backend:
    - "Controller e WebSocket handler nunca acessam repository (verificado por ControllerLayeringTest.java)"
    - "Serviços expõem interface em service/ e implementação em service/implementation/"
    - "DTOs record para entrada (LoginDto, SessionCreateDto, SessionJoinDto, FriendRequestCreateDto); classes com factory estático from() para saída"
    - "Lombok: @Getter/@Setter/@RequiredArgsConstructor"
    - "Erros de domínio: EntityNotFoundException=404, IllegalArgumentException=400, IllegalStateException=409, AccessDeniedException=403 (ApiExceptionHandler)"
    - "Ator sempre recebido por path ou body (userId/hostId), nunca derivado do SecurityContext — SessionCreateDto.java:10, SessionJoinDto.java:6"
  frontend:
    - "TypeScript strict, sem any implícito tolerado"
    - "Comunicação UI↔engine apenas via GLOBAL_BUS (EventBus) e useBusEvent/BusSubscriptions"
    - "Todo dispose é obrigatório porque React StrictMode monta duas vezes — Engine.dispose, SyncEngine.stop, PresenceService.stop"
    - "Operação CRDT carrega resultado, não receita; JSON puro, sem classes three.js (frontend/src/collab/Operation.ts)"
```

Fronteiras que o Agente Planejador não deve alterar sem autorização:

```yaml
boundaries:
  - id: "rest_contract"
    desc: "Rotas, verbos, status e shape de ApiErrorDto"
    evidence: "controller/*.java, dto/ApiErrorDto.java:11"
  - id: "ws_protocol"
    desc: "Nomes dos tipos de mensagem e campos (sync_hello, sync_ops, presence, chat, scene_snapshot, sync_ack, session_roster, error)"
    evidence: "websocket/SessionSocketHandler.java:93-99"
  - id: "op_schema"
    desc: "Formato {id:{siteId,lamport}, author, deps, kind} e kinds aceitos; validate.ts e OperationValidator precisam mudar juntos"
    evidence: "frontend/src/collab/validate.ts, websocket/OperationValidator.java:113-120"
  - id: "db_schema"
    desc: "Nomes de tabelas e constraints de idempotência (uk_session_operation_seq, uk_session_operation_op, uk_session_participant)"
    evidence: "model/SessionOperation.java:42, model/SessionParticipant.java:33"
  - id: "layering"
    desc: "Controller/WS → Service → Repository; proibido acesso direto a repository a partir de controller"
    evidence: "ControllerLayeringTest.java"
  - id: "columns_legacy"
    desc: "sessions.user_id mantido como coluna do host por compatibilidade de schema; não renomear"
    evidence: "model/Session.java"
  - id: "single_instance"
    desc: "SessionConnectionRegistry é estado em memória; não introduzir escala horizontal sem broker"
    evidence: "websocket/SessionConnectionRegistry.java, docs/backend-architecture.md"
```

# 8. CURRENT STATUS & TECHNICAL DEBT

Critério aplicado: `IMPLEMENTED` = rota/handler registrado + lógica real + teste existente; `PARTIAL` = lógica real sem persistência ou uso completo; `STUB/DEAD` = código declarado mas não executado ou rejeitado; `UNKNOWN` = evidência insuficiente.

```yaml
status:
  implemented:
    - {feature: "Registro com confirmação por e-mail", evidence: "controller/UserController.java:33, service/implementation/UserServiceImpl.java, EmailConfirmationEndToEndTest.java"}
    - {feature: "Login/logout por sessão HTTP + CSRF", evidence: "controller/AuthController.java:40-63, config/SecurityConfig.java:69-80, controller/AuthControllerTest.java"}
    - {feature: "Bloqueio de login até email_verified", evidence: "service/implementation/UserDetailsServiceImpl.java:34"}
    - {feature: "CRUD de usuário", evidence: "controller/UserController.java:53-94, controller/UserControllerTest.java (16 @Test)"}
    - {feature: "Pedidos de amizade (enviar/listar/aceitar/rejeitar/cancelar) e lista/remoção", evidence: "controller/UserController.java:125-185, controller/FriendRequestControllerTest.java (11 @Test)"}
    - {feature: "Ciclo de sala (criar/abrir/por código/entrar/sair/encerrar/participantes/salas de amigos)", evidence: "controller/SessionController.java:40-114, controller/SessionControllerTest.java (9 @Test)"}
    - {feature: "Autorização de entrada (amigo do host) e limite de 4", evidence: "service/implementation/SessionServiceImpl.java:337-355"}
    - {feature: "Ordem total, dedupe e persistência de operações", evidence: "service/implementation/SessionServiceImpl.java:232-270, model/SessionOperation.java:42"}
    - {feature: "WebSocket colaborativo: handshake, catch-up por version vector, relay, roster, acks", evidence: "websocket/SessionSocketHandler.java, websocket/SessionWebSocketTest.java (5 @Test)"}
    - {feature: "Snapshot de cena (escrita/leitura)", evidence: "websocket/SessionSocketHandler.java:230, controller/SessionController.java:119"}
    - {feature: "CRDT cliente (LWW + tombstones + replay)", evidence: "frontend/src/collab/DocumentState.ts:33"}
    - {feature: "Primitivas, transform gizmo, cor, exclusão e undo/redo por command stack", evidence: "frontend/src/command/implementation, frontend/src/core/controllers/ActionRouter.ts"}
    - {feature: "Presença e selection advisory lock", evidence: "frontend/src/collab/PresenceService.ts:17"}
    - {feature: "Chat de sessão (efêmero)", evidence: "frontend/src/react/ui/ChatPanel.tsx, websocket/SessionSocketHandler.java:212"}
    - {feature: "Import .obj e export .obj (local)", evidence: "frontend/src/core/ObjectParser.ts, frontend/src/core/utils/FileExporter.ts"}
    - {feature: "Mesh edit half-edge (vertex/edge/face, extrude, split)", evidence: "frontend/src/tool/implementation/MeshEditTool.ts, frontend/src/command/implementation/MeshEditCommand.ts"}
  partial:
    - {feature: "Timeline scrubber", gap: "replay só conta objetos; não reconstrói cena 3D histórica", evidence: "frontend/src/react/ui/TimelinePanel.tsx"}
    - {feature: "scene_snapshot como reidratação", gap: "nenhum fromSnapshot; reabrir sessão depende do replay do log", evidence: "docs/backend-architecture.md"}
    - {feature: "Presença online fora de sessão", gap: "amigo aparece apenas hosting ou offline", evidence: "frontend/src/react/ui/UseSocial.ts:23-28"}
  stub_or_dead:
    - {feature: "mesh_edit e undo como operações CRDT", state: "declaradas em Operation.ts e rejeitadas por validate.ts e OperationValidator (ambos default false)", evidence: "frontend/src/collab/Operation.ts, frontend/src/collab/validate.ts, websocket/OperationValidator.java:113-120"}
    - {feature: "AddObjectCommand", state: "dead code, caminho local não instanciado", evidence: "frontend/src/command/implementation/CreateObjectCommand.ts:11, docs/frontend-architecture.md"}
    - {feature: "SessionService.syncSinceSeq", state: "declarado e implementado sem chamador no handler WebSocket", evidence: "service/SessionService.java, service/implementation/SessionServiceImpl.java:288, websocket/SessionSocketHandler.java"}
    - {feature: "SessionParticipant.deleteBySessionIdAndUserId", state: "declarado no repository sem uso detectado", evidence: "repository/SessionParticipantRepository.java"}
  unknown:
    - {item: "Suíte de testes executando", reason: "mvnw test não executado nesta varredura (requer Docker/Postgres); contagem por grep de @Test", evidence: "backend/blenderpds/src/test/java"}
    - {item: "Comportamento em produção", reason: "sem Dockerfile, CI ou configuração de deploy", evidence: "ausência de .github/ e Dockerfile"}
    - {item: "Build TypeScript válido", reason: "npm run build não executado nesta varredura", evidence: "frontend/package.json:12"}
```

```yaml
technical_debt:
  - id: "ddl_auto_destructive"
    desc: "spring.jpa.hibernate.ddl-auto=create recria o schema a cada start; docs afirmam update"
    evidence: "application.properties:8 vs docs/backend-architecture.md"
    impact: "perda de dados em dev; sem caminho de migração"
  - id: "actor_identity_from_request"
    desc: "userId/hostId vêm de path/body/query sem verificação contra o principal autenticado, permitindo agir como outro usuário autenticado"
    evidence: "dto/SessionCreateDto.java:10, dto/SessionJoinDto.java:6, websocket/SessionHandshakeInterceptor.java, controller/UserController.java:66-81"
  - id: "mixed_jackson_packages"
    desc: "UserDto importa com.fasterxml.jackson.annotation.JsonProperty enquanto o restante usa tools.jackson (Jackson 3); sem dependência Jackson 2 declarada no pom"
    evidence: "dto/UserDto.java:4, websocket/SessionSocketHandler.java"
    impact: "UNKNOWN se resolve transitivamente"
  - id: "no_frontend_tests"
    desc: "nenhum runner de teste no frontend; única verificação é tsc strict"
    evidence: "frontend/package.json, README.md"
  - id: "no_ci"
    desc: "ausência de pipeline, Dockerfile ou script de deploy"
    evidence: "git ls-files sem .github/ e Dockerfile"
  - id: "in_memory_registry"
    desc: "SessionConnectionRegistry impede escala horizontal"
    evidence: "websocket/SessionConnectionRegistry.java"
  - id: "linear_scans"
    desc: "syncSince e syncSinceSeq carregam o log inteiro e filtram em memória"
    evidence: "service/implementation/SessionServiceImpl.java:273,288"
  - id: "user_enumeration"
    desc: "busca de amigo por nickname faz GET /users (lista todos) no cliente"
    evidence: "frontend/src/api/Backend.ts:192, controller/UserController.java:53"
  - id: "hardcoded_dev_credentials"
    desc: "credenciais Postgres literais em compose.yaml versionado"
    evidence: "backend/blenderpds/compose.yaml"
  - id: "duplicate_root_package"
    desc: "package.json raiz redeclara react, react-dom, react-router-dom e @types/node sem scripts; frontend/package.json é o manifesto real"
    evidence: "package.json"
  - id: "stale_package_description"
    desc: "description do frontend referencia 'npx serve src/'"
    evidence: "frontend/package.json"
  - id: "oauth2_starter_unused"
    desc: "spring-boot-starter-security-oauth2-client presente sem configuração de client OAuth2"
    evidence: "backend/blenderpds/pom.xml:47"
  - id: "doc_code_drift"
    desc: "docs citam FaceExtrudeCommand em MeshEditCommand.ts:68 e descrevem fluxo histórico de peers WebRTC"
    evidence: "docs/frontend-architecture.md, frontend/src/command/implementation/MeshEditCommand.ts:68"
```

TODO/FIXME explícitos: nenhuma ocorrência de `TODO`, `FIXME` ou `NotImplemented` em `backend/` ou `frontend/src` (grep sem resultados). Único marcador inline de incompletude: `frontend/src/collab/DocumentState.ts:9` (`geometry: string;//placeholder for basic shapes`), que documenta que `geometry` é nome de primitiva, não geometria serializada.

Roadmap declarado pelo projeto (`frontend/backlog.md`): edição de materiais, mais primitivas, distorções booleanas, correção do export de cena, `mesh_edit` via CRDT, import `.obj` via CRDT, arquivo de cena baseado no CRDT.
