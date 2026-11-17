# Diagramas — collab3d (estado v0.4)

Diagramas para a apresentação de PDS, gerados a partir do código em HEAD. Cada figura
existe em `.mmd` (fonte), `.svg` (vetor) e `.png` (2400 px de largura, fundo branco).

## Convenção de cores

| Cor | Significado |
|---|---|
| Azul | **frozen-spot**: parte fixa do framework |
| Amarelo | **hot-spot**: SPI/ponto de variação que a aplicação implementa |
| Verde | **app design-editor**: kinds, ferramentas, projeção |
| Cinza | **infraestrutura externa** (PostgreSQL, Mailpit, three.js, Spring Boot) |

## Como renderizar de novo

```bash
npx --yes @mermaid-js/mermaid-cli@11.12.0 -i docs/diagrams/src/a1-camadas.mmd \
  -o docs/diagrams/out/a1-camadas.svg -b white -w 2400
npx --yes @mermaid-js/mermaid-cli@11.12.0 -i docs/diagrams/src/a1-camadas.mmd \
  -o docs/diagrams/out/a1-camadas.png -b white -w 2400
```

O mmdc precisa de um Chromium; sem ele, use o mesmo bloco Mermaid em
<https://mermaid.live> (exportar PNG/SVG). Os PNGs entregues foram normalizados para
2400 px de largura e fundo branco com Pillow quando o mmdc gerou menos que isso.

## Índice

| # | Diagrama | Fonte | Imagem |
|---|---|---|---|

| A1 | A1 — visão em camadas | [src/a1-camadas.mmd](src/a1-camadas.mmd) | [SVG](out/a1-camadas.svg) · [PNG](out/a1-camadas.png) |

| A2 | A2 — arquitetura do backend | [src/a2-backend.mmd](src/a2-backend.mmd) | [SVG](out/a2-backend.svg) · [PNG](out/a2-backend.png) |

| A3 | A3 — arquitetura do frontend | [src/a3-frontend.mmd](src/a3-frontend.mmd) | [SVG](out/a3-frontend.svg) · [PNG](out/a3-frontend.png) |

| A4 | A4 — fluxo de uma operação colaborativa | [src/a4-fluxo-operacao.mmd](src/a4-fluxo-operacao.mmd) | [SVG](out/a4-fluxo-operacao.svg) · [PNG](out/a4-fluxo-operacao.png) |

| A5 | A5 — conexão e catch-up | [src/a5-conexao-catchup.mmd](src/a5-conexao-catchup.mmd) | [SVG](out/a5-conexao-catchup.svg) · [PNG](out/a5-conexao-catchup.png) |

| B1 | B1 — domínio JPA | [src/b1-dominio.mmd](src/b1-dominio.mmd) | [SVG](out/b1-dominio.svg) · [PNG](out/b1-dominio.png) |

| B2a | B2a — SPIs de sincronização e mensagens | [src/b2-spis-sincronizacao.mmd](src/b2-spis-sincronizacao.mmd) | [SVG](out/b2-spis-sincronizacao.svg) · [PNG](out/b2-spis-sincronizacao.png) |

| B2b | B2b — SPIs de validação de kind e conexão | [src/b2-spis-conexao-validacao.mmd](src/b2-spis-conexao-validacao.mmd) | [SVG](out/b2-spis-conexao-validacao.svg) · [PNG](out/b2-spis-conexao-validacao.png) |

| B3 | B3 — WebSocket | [src/b3-websocket.mmd](src/b3-websocket.mmd) | [SVG](out/b3-websocket.svg) · [PNG](out/b3-websocket.png) |

| B4 | B4 — CRDT e sincronização no cliente | [src/b4-crdt-sync.mmd](src/b4-crdt-sync.mmd) | [SVG](out/b4-crdt-sync.svg) · [PNG](out/b4-crdt-sync.png) |

| B5a | B5a — composição e render | [src/b5-render-core.mmd](src/b5-render-core.mmd) | [SVG](out/b5-render-core.svg) · [PNG](out/b5-render-core.png) |

| B5b | B5b — ferramentas, comandos e formatos | [src/b5-editor-app.mmd](src/b5-editor-app.mmd) | [SVG](out/b5-editor-app.svg) · [PNG](out/b5-editor-app.png) |



## A1 — visão em camadas

Direção única de dependência: app → framework → infraestrutura. A regra “framework não importa apps” é imposta por `check-boundaries.mjs` e `check-no-domain-kinds.sh`.

```mermaid
flowchart TB
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef infra fill:#e5e7eb,stroke:#374151,color:#0f172a

    subgraph APPS["Aplicação — apps/design-editor"]
        WEB["web<br/>blenderpds"]:::app
        API["backend<br/>design-editor-backend"]:::app
    end

    subgraph FW["Framework — framework/"]
        STARTER["backend-starter<br/>collab3d-spring-boot-starter"]:::frozen
        CORE["core<br/>@collab3d/core"]:::frozen
        KIT["react-kit<br/>@collab3d/react-kit"]:::frozen
        RULE["Regra: framework não importa apps"]:::hotspot
        G1["scripts/check-boundaries.mjs"]:::hotspot
        G2["scripts/check-no-domain-kinds.sh"]:::hotspot
    end

    subgraph INFRA["Infraestrutura"]
        BOOT["Spring Boot 4.1.1"]:::infra
        PG["PostgreSQL 16"]:::infra
        MAIL["Mailpit"]:::infra
        THREE["three.js"]:::infra
    end

    WEB --> CORE
    WEB --> KIT
    API --> STARTER
    RULE -.-> G1
    RULE -.-> G2
    STARTER --> BOOT
    STARTER --> PG
    STARTER --> MAIL
    CORE --> THREE
```


## A2 — arquitetura do backend

Entrada REST/WebSocket, handlers, autoridade (validação, admissão, sequenciador) e persistência. HS1/HS2/HS5 marcam onde as SPIs de variação entram.

```mermaid
flowchart TB
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a
    classDef infra fill:#e5e7eb,stroke:#374151,color:#0f172a

    subgraph ENTRADA["Entrada"]
        CTRL["SessionController<br/>UserController<br/>AuthController"]:::frozen
        SOCK["SessionSocketHandler"]:::frozen
        HANDSHAKE["SessionHandshakeInterceptor"]:::frozen
        CATALOG["MessageCatalog"]:::frozen
    end

    subgraph HANDLERS["Handlers de mensagem (HS2)"]
        H1["SyncHelloHandler"]:::frozen
        H2["SyncOpsHandler"]:::frozen
        H3["SnapshotHandler"]:::frozen
        H4["ChatRelayHandler"]:::frozen
        H5["PresenceRelayHandler"]:::frozen
        RATE["RateLimitPolicy<br/>TokenBucketRateLimitPolicy"]:::hotspot
    end

    subgraph SERVICOS["Serviços e autoridade"]
        SSVC["SessionService<br/>SessionServiceImpl"]:::frozen
        APPENDER["OperationAppender"]:::frozen
        VALID["OperationValidator<br/>OperationKindRegistry"]:::frozen
        SEQ["OperationSequencer"]:::frozen
        STATE["SessionStateStore"]:::frozen
    end

    subgraph POLICIES["Cadeias de policies (HS1/HS5)"]
        ADM["OperationAdmissionPolicy<br/>AdmitAllPolicy"]:::hotspot
        RED["SessionStateReducer"]:::hotspot
        SNP["SnapshotPolicy<br/>HostOnlySnapshotPolicy"]:::hotspot
        JOIN["SessionJoinPolicy<br/>HostFriendJoinPolicy"]:::hotspot
        CAP["SessionCapacityPolicy<br/>FixedCapacityPolicy"]:::hotspot
        VIS["SessionVisibilityPolicy<br/>AlwaysVisiblePolicy"]:::hotspot
        KINDS["OperationKindValidator<br/>5 kinds do editor"]:::app
    end

    subgraph FANOUT["Fan-out"]
        BCAST["SessionBroadcaster<br/>InMemorySessionBroadcaster"]:::frozen
        REG["SessionConnectionRegistry<br/>SessionConnection"]:::frozen
        FRAME["FrameBatcher<br/>WsFrames"]:::frozen
    end

    subgraph PERSIST["Persistência"]
        REPO["Repositories Spring Data"]:::frozen
        DB[("PostgreSQL")]:::infra
    end

    CTRL --> SSVC
    HANDSHAKE --> SSVC
    SOCK --> RATE
    SOCK --> CATALOG
    CATALOG --> H1
    CATALOG --> H2
    CATALOG --> H3
    CATALOG --> H4
    CATALOG --> H5
    H2 --> APPENDER
    H3 --> SSVC
    H1 --> SSVC
    APPENDER --> VALID
    VALID --> KINDS
    APPENDER --> ADM
    APPENDER --> SEQ
    APPENDER --> STATE
    RED --> STATE
    SEQ --> REPO
    SSVC --> JOIN
    SSVC --> CAP
    SSVC --> VIS
    SSVC --> SNP
    SSVC --> REPO
    H2 --> BCAST
    BCAST --> REG
    H2 --> FRAME
    REPO --> DB
```


## A3 — arquitetura do frontend

`createCollabApp` é a raiz de composição: monta cena, `SyncEngine`, réplica e presença; o app registra kinds, ferramentas, comandos e formatos.

```mermaid
flowchart TB
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a
    classDef infra fill:#e5e7eb,stroke:#374151,color:#0f172a

    subgraph APP["apps/design-editor/web"]
        CREATE["createEditorApp"]:::app
        KINDS["kinds/*<br/>OperationKindDefinition"]:::app
        TOOLS["ToolManager + Tools"]:::app
        CMDS["CommandManager + Command"]:::app
        PROJ["SceneProjector"]:::app
        FMT["objFormat + ObjImporter + ObjExporter"]:::app
    end

    subgraph ROOT["Composition root — @collab3d/core"]
        COLLAB["CollabApp<br/>CollabAppConfig"]:::frozen
        HOST["SceneHost"]:::frozen
    end

    subgraph SYNC["Sincronização"]
        ENGINE["SyncEngine"]:::frozen
        REGISTRY["MessageRegistry<br/>MessageDefinition"]:::frozen
        POLICY["SyncPolicy"]:::hotspot
    end

    subgraph REPLICA["Réplica"]
        SESSION["ReplicaSession"]:::app
        LOG["OpLog"]:::frozen
        DOC["DocumentState"]:::frozen
        CLOCK["LamportClock"]:::frozen
    end

    subgraph COMUNICACAO["Comunicação"]
        PRESENCA["PresenceChannel"]:::frozen
        TRANSPORT["Transport<br/>WebSocketTransport"]:::hotspot
        API["BackendClient"]:::frozen
    end

    subgraph RENDER["Render"]
        PROJIF["Projector"]:::hotspot
        THREE["three.js"]:::infra
    end

    CREATE --> COLLAB
    CREATE --> PROJ
    CREATE --> KINDS
    CREATE --> TOOLS
    CREATE --> CMDS
    COLLAB --> HOST
    COLLAB --> ENGINE
    COLLAB -.-> SESSION
    ENGINE --> REGISTRY
    ENGINE --> POLICY
    ENGINE --> TRANSPORT
    REGISTRY --> POLICY
    SESSION --> LOG
    SESSION --> DOC
    SESSION --> CLOCK
    PROJ --> PROJIF
    PROJ --> DOC
    HOST --> THREE
    PROJIF --> THREE
    PRESENCA --> TRANSPORT
    TOOLS --> CMDS
    CMDS --> SESSION
    DOC --> KINDS
    FMT --> CMDS
    FMT --> DOC
```


## A4 — fluxo de uma operação colaborativa

Do arraste ao broadcast, incluindo rejeição por envelope/kind (`INVALID_OP`), recusa de admissão (`OP_REJECTED`) e a isenção de `sync_ops` no rate limit.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant CMD as Command<br/>(TransformCommand)
    participant REP as ReplicaSession
    participant ENG as SyncEngine
    participant TR as WebSocketTransport
    participant SOCK as SessionSocketHandler
    participant OPS as SyncOpsHandler
    participant APP as OperationAppender
    participant VAL as OperationValidator
    participant REG as OperationKindRegistry
    participant SEQ as OperationSequencer
    participant DB as PostgreSQL
    participant BC as SessionBroadcaster
    participant OUTRA as Outra réplica
    participant PROJ as SceneProjector

    U->>CMD: arrasta o objeto
    CMD->>REP: commit(op)
    REP->>REP: OpLog.append + DocumentState.apply
    REP-->>ENG: onLocalOp(op)
    ENG->>TR: send({type:"sync_ops", ops:[op]})
    TR->>SOCK: frame WebSocket
    Note over SOCK: rate limit por conexão/tipo<br/>sync_ops é isento
    SOCK->>SOCK: MessageCatalog.find("sync_ops")
    SOCK->>OPS: handle(ctx, frame) sob runLocked
    OPS->>APP: append(ops)
    APP->>VAL: validateBatch(ops)
    VAL->>REG: find(kind)

    alt envelope/kind inválido
        APP-->>SOCK: InvalidOperationException("BATCH")
        SOCK-->>TR: error{INVALID_OP}
        Note over TR: a operação não entra no log
    else válido
        APP->>APP: OperationAdmissionPolicy.admit
        alt política recusa
            APP-->>OPS: AppendResult.rejected
            OPS-->>TR: error{OP_REJECTED}
        else admitida
            APP->>SEQ: append(sessionId, userId, inputs)
            SEQ->>DB: existe (siteId, lamport)?
            SEQ->>DB: INSERT operations com seq
            APP->>APP: SessionStateStore.advance
            OPS->>BC: broadcastExcept(sender, sync_ops)
            BC->>OUTRA: sync_ops
            OPS-->>TR: sync_ack{siteId, lamport, seq}
        end
    end

    OUTRA->>OUTRA: SyncEngine.receive → ReplicaSession.receive
    OUTRA->>PROJ: apply(changes)
```


## A5 — conexão e catch-up

Login por cookie, handshake com `Principal`, políticas de entrada, `sync_hello`, `sync_snapshot` + operações paginadas por bytes e o snapshot periódico do host.

```mermaid
sequenceDiagram
    autonumber
    actor B as Navegador
    participant AUTH as AuthController
    participant HS as SessionHandshakeInterceptor
    participant SS as SessionService
    participant SOCK as SessionSocketHandler
    participant HELLO as SyncHelloHandler
    participant DB as PostgreSQL
    participant SNAP as SnapshotHandler

    B->>AUTH: POST /auth/login
    AUTH-->>B: JSESSIONID (cookie HttpOnly)
    B->>HS: upgrade /ws/sessions/{id} (cookie)
    HS->>HS: Principal → userId
    HS->>SS: connectParticipant(sessionId, userId)
    SS->>SS: SessionJoinPolicy + SessionCapacityPolicy
    alt não é amigo / sala cheia / encerrada
        HS-->>B: 403 ou 409 (sem upgrade)
    else admitido
        HS-->>SOCK: handshake aceito (attrs sessionId, userId)
        SOCK->>SOCK: registry.register + broadcastRoster
        SOCK-->>B: session_roster
        B->>HELLO: sync_hello{vv}
        alt vv vazio e há snapshot
            HELLO->>DB: SessionService.getSnapshot
            HELLO-->>B: sync_snapshot{baseSeq, versionVector, state, checksum}
        end
        HELLO->>DB: syncSinceSeq(cursor, chunkSize)
        HELLO-->>B: sync_ops (páginas, cortadas por bytes)
        HELLO->>SOCK: finishCatchUp
    end
    Note over B,SNAP: host publica a cada SyncPolicy.snapshotIntervalMs
    B->>SNAP: scene_snapshot{snapshot}
    SNAP->>SS: saveSnapshot (HostOnlySnapshotPolicy, checksum)
    SS->>DB: UPDATE sessions.snapshot, snapshot_seq
```


## B1 — domínio JPA

Entidades, enums e cardinalidades reais. `User.friendList` é muitos-para-muitos; `SessionOperation.author` é opcional (o autor pode ser removido).

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a
    classDef infra fill:#e5e7eb,stroke:#374151,color:#0f172a

    class User {
        +Long id
        +String nickname
        +String email
        +String passwordHash
        +Role role
        +boolean emailVerified
        +Set friendList
        +Instant createdAt
    }
    class FriendRequest {
        +Long id
        +Instant createdAt
    }
    class Session {
        +Long id
        +SessionStatus status
        +String appType
        +String code
        +String sceneSnapshot
        +Long snapshotSeq
        +Integer snapshotVersion
        +Instant endedAt
    }
    class SessionParticipant {
        +Long id
        +boolean active
        +Instant joinedAt
        +Instant lastSeenAt
    }
    class SessionOperation {
        +Long id
        +Long seq
        +String siteId
        +Long lamport
        +String kind
        +String payload
        +Instant createdAt
    }
    class EmailConfirmationToken {
        +Long id
        +String token
        +Instant expiresAt
    }
    class Role {
        <<enum>>
        USER
        ADMIN
    }
    class SessionStatus {
        <<enum>>
        WAITING
        ACTIVE
        ENDED
    }

    User "1" --> "0..*" FriendRequest : sender
    User "1" --> "0..*" FriendRequest : receiver
    User "1" --> "0..*" Session : host
    User "1" --> "0..*" SessionParticipant : participa
    Session "1" --> "0..*" SessionParticipant : participantes
    Session "1" --> "0..*" SessionOperation : operações
    User "1" --> "0..*" SessionOperation : author
    User "1" --> "0..*" EmailConfirmationToken : tokens
    User "1" <--> "0..*" User : friendList
    User ..> Role
    Session ..> SessionStatus

    cssClass "User,FriendRequest,Session,SessionParticipant,SessionOperation,EmailConfirmationToken" frozen
    cssClass "Role,SessionStatus" hotspot
```


## B2a — SPIs de sincronização e mensagens

Interfaces de HS1/HS2/HS3/HS6, agrupadas por hot-spot via `namespace`, e as implementações default. `SessionStateReducer` e `MessageValidator` não têm implementação no app.

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    namespace HS1 {
        class OperationAdmissionPolicy {
            <<interface>>
            +admit(ctx, actor, operation, state) Optional
        }
        class SessionStateReducer {
            <<interface>>
            +initial(ctx) S
            +reduce(current, operation, seq) S
            +stateType() Class
        }
        class SnapshotPolicy {
            <<interface>>
            +mayWrite(ctx, actor, snapshot) boolean
            +maxBytes() int
        }
        class AdmitAllPolicy
        class HostOnlySnapshotPolicy
    }
    namespace HS2 {
        class MessageTypeHandler {
            <<interface>>
            +type() String
            +delivery() Delivery
            +handle(ctx, payload) void
        }
        class SessionBroadcaster {
            <<interface>>
            +broadcast(sessionId, frame) void
            +broadcastExcept(sessionId, connectionId, frame) void
        }
        class InMemorySessionBroadcaster
    }
    namespace HS3 {
        class MessageValidator {
            <<interface>>
            +supports(messageType) boolean
            +validate(ctx, actor, payload) void
        }
    }
    namespace HS6 {
        class SnapshotCodec {
            <<interface>>
            +currentSchemaVersion() int
            +migrate(snapshot, fromVersion) JsonNode
        }
    }

    OperationAdmissionPolicy <|.. AdmitAllPolicy
    SnapshotPolicy <|.. HostOnlySnapshotPolicy
    SessionBroadcaster <|.. InMemorySessionBroadcaster

    note for SessionStateReducer "sem implementação no app atual"
    note for MessageValidator "sem implementação no app atual"
    note for SnapshotCodec "migrate ainda não é chamado na leitura"

    cssClass "OperationAdmissionPolicy,SessionStateReducer,SnapshotPolicy,MessageTypeHandler,SessionBroadcaster,MessageValidator,SnapshotCodec" hotspot
    cssClass "AdmitAllPolicy,HostOnlySnapshotPolicy,InMemorySessionBroadcaster" frozen
```


## B2b — SPIs de validação de kind e conexão

Os cinco validadores do editor (HS3), as políticas de entrada/capacidade/visibilidade (HS5), rate limit (P3.4) e `ServerOperationEmitter` (sem implementação).

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    namespace HS1 {
        class ServerOperationEmitter {
            <<interface>>
            +followUps(ctx, appended, state) List
        }
    }
    namespace HS3 {
        class OperationKindValidator {
            <<interface>>
            +kind() String
            +validate(operation) void
        }
        class AddObjectKindValidator
        class ChangeColorKindValidator
        class RemoveObjectKindValidator
        class SetTransformKindValidator
        class SetMeshKindValidator
    }
    namespace HS5 {
        class SessionJoinPolicy {
            <<interface>>
            +decide(ctx, joiner, request) JoinDecision
        }
        class SessionCapacityPolicy {
            <<interface>>
            +maxParticipants(ctx) int
        }
        class SessionVisibilityPolicy {
            <<interface>>
            +visibleTo(ctx, viewer) boolean
        }
        class HostFriendJoinPolicy
        class FixedCapacityPolicy
        class AlwaysVisiblePolicy
    }
    namespace RateLimit {
        class RateLimitPolicy {
            <<interface>>
            +allow(connectionId, messageType) boolean
        }
        class TokenBucketRateLimitPolicy
    }

    OperationKindValidator <|.. AddObjectKindValidator
    OperationKindValidator <|.. ChangeColorKindValidator
    OperationKindValidator <|.. RemoveObjectKindValidator
    OperationKindValidator <|.. SetTransformKindValidator
    OperationKindValidator <|.. SetMeshKindValidator
    SessionJoinPolicy <|.. HostFriendJoinPolicy
    SessionCapacityPolicy <|.. FixedCapacityPolicy
    SessionVisibilityPolicy <|.. AlwaysVisiblePolicy
    RateLimitPolicy <|.. TokenBucketRateLimitPolicy

    note for ServerOperationEmitter "sem implementação até a Fase 4"
    note for RateLimitPolicy "isenta sync_ops e sync_hello"

    cssClass "OperationKindValidator,SessionJoinPolicy,SessionCapacityPolicy,SessionVisibilityPolicy,ServerOperationEmitter,RateLimitPolicy" hotspot
    cssClass "HostFriendJoinPolicy,FixedCapacityPolicy,AlwaysVisiblePolicy,TokenBucketRateLimitPolicy" frozen
    cssClass "AddObjectKindValidator,ChangeColorKindValidator,RemoveObjectKindValidator,SetTransformKindValidator,SetMeshKindValidator" app
```


## B3 — WebSocket

Despachante, catálogo, handlers, validação de operações e registry de conexões. `FrameBatcher` corta frames por bytes antes do broadcast.

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    class SessionSocketHandler {
        +afterConnectionEstablished(socket) void
        +handleTextMessage(socket, message) void
        +afterConnectionClosed(socket, status) void
    }
    class MessageCatalog {
        -Map byType
        +find(type) Optional
        +types() List
    }
    class AbstractMessageTypeHandler {
        <<abstract>>
        +handle(ctx, payload) void
        #validate(ctx, payload) void
        #authorize(ctx, payload) void
        #execute(ctx, payload) void
    }
    class MessageTypeHandler {
        <<interface>>
        +type() String
        +delivery() Delivery
    }
    class SyncHelloHandler
    class SyncOpsHandler
    class SnapshotHandler
    class ChatRelayHandler
    class PresenceRelayHandler
    class OperationValidator {
        +validateBatch(opsNode) List
        +validate(node) Optional
    }
    class OperationAppender {
        +append(sessionId, actor, ops) AppendResult
    }
    class OperationKindRegistry {
        -Map byKind
        +find(kind) Optional
        +kinds() List
    }
    class SessionConnectionRegistry {
        +register(connection) void
        +remove(connection) void
        +runLocked(sessionId, action) void
        +broadcast(sessionId, frame, except) void
        +closeAll(sessionId, status) void
    }
    class SessionConnection {
        +send(frame) void
        +sendNow(frame) void
        +finishCatchUp() void
        +close(status) void
    }
    class FrameBatcher {
        <<utility>>
        +split(operations, maxOps, maxBytes, encode) List
    }
    class SessionHandshakeInterceptor {
        +beforeHandshake(request, response, wsHandler, attributes) boolean
    }
    class WsFrames {
        +syncOps(operations) ObjectNode
        +syncSnapshot(snapshot) ObjectNode
        +ack(operation) ObjectNode
        +roster(sessionId, status, participants) ObjectNode
        +error(code, detail) ObjectNode
    }

    SessionSocketHandler *-- MessageCatalog
    SessionSocketHandler --> SessionConnectionRegistry
    SessionSocketHandler ..> RateLimitPolicy
    MessageCatalog o-- MessageTypeHandler
    MessageTypeHandler <|.. AbstractMessageTypeHandler
    AbstractMessageTypeHandler <|-- SyncHelloHandler
    AbstractMessageTypeHandler <|-- SyncOpsHandler
    AbstractMessageTypeHandler <|-- SnapshotHandler
    AbstractMessageTypeHandler <|-- ChatRelayHandler
    AbstractMessageTypeHandler <|-- PresenceRelayHandler
    SyncOpsHandler ..> OperationAppender
    OperationAppender ..> OperationValidator
    OperationValidator --> OperationKindRegistry
    SessionConnectionRegistry o-- SessionConnection
    SyncOpsHandler ..> FrameBatcher
    SyncHelloHandler ..> FrameBatcher
    SyncOpsHandler ..> WsFrames
    SyncHelloHandler ..> WsFrames

    class RateLimitPolicy {
        <<interface>>
    }
    cssClass "SessionSocketHandler,MessageCatalog,SessionConnectionRegistry,SessionConnection,FrameBatcher,SessionHandshakeInterceptor,WsFrames,OperationAppender,OperationValidator,OperationKindRegistry" frozen
    cssClass "MessageTypeHandler,AbstractMessageTypeHandler,MessageCatalog" frozen
    cssClass "RateLimitPolicy" hotspot
```


## B4 — CRDT e sincronização no cliente

Peças da réplica (`OpLog`, `DocumentState`, `LamportClock`), estratégias de merge, protocolo (`MessageRegistry`) e presença. `LwwStrategy`/`TombstoneSetStrategy` são objetos constantes.

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    class DocumentRecord {
        <<interface>>
        +string id
        +OpId addStamp
        +OpId removeStamp
        +boolean deleted
    }
    class BaseOperation {
        <<interface>>
        +OpId id
        +string author
        +OpId[] deps
        +string kind
    }
    class OpId {
        <<interface>>
        +number lamport
        +string siteId
    }
    class LamportClock {
        +string id
        +tick() OpId
        +observe(stamp) void
    }
    class OpLog {
        +append(op) boolean
        +since(vv) BaseOperation[]
        +versionVector() VersionVector
    }
    class LWWRegister {
        +value T
        +OpId stamp
        +set(value, stamp) boolean
    }
    class DocumentState {
        +apply(op) Change[]
        +toSnapshot() DocumentSnapshot
        +restore(snapshot) void
    }
    class OperationKindRegistry {
        +register(definition) OperationKindRegistry
    }
    class LwwStrategy {
        <<const>>
        +read(record, field)
        +write(record, field, value, stamp) boolean
    }
    class TombstoneSetStrategy {
        <<const>>
        +isPresent(record) boolean
        +add(record, stamp) void
        +remove(record, stamp) void
    }
    class ReplicaSession {
        +commit(op) Operation
        +receive(op) void
        +restoreSnapshot(snapshot, vv) void
        +toSnapshot() DocumentSnapshot
    }
    class SyncEngine {
        +start() void
        +stop() void
    }
    class SyncPolicy {
        <<interface>>
        +chunkSize number
        +maxOpsPerMessage number
        +maxFrameBytes number
        +snapshotIntervalMs number
        +validateOperation(op) boolean
    }
    class MessageRegistry {
        +register(definition) MessageRegistry
        +get(type) MessageDefinition
    }
    class MessageDefinition {
        <<interface>>
        +string type
        +validate(payload) boolean
        +handle(payload, context) void
    }
    class Transport {
        <<interface>>
        +send(data) void
        +onMessage(callback) void
    }
    class WebSocketTransport
    class PresenceChannel {
        +publish(state) void
        +peers() PresenceEntry[]
        +stop() void
    }

    OpLog o-- BaseOperation
    BaseOperation --> OpId
    LamportClock ..> OpId
    DocumentState o-- OperationKindRegistry
    DocumentState o-- LWWRegister
    LwwStrategy ..> DocumentRecord
    LwwStrategy ..> LWWRegister
    TombstoneSetStrategy ..> DocumentRecord
    DocumentState o-- DocumentRecord
    ReplicaSession *-- OpLog
    ReplicaSession *-- DocumentState
    ReplicaSession *-- LamportClock
    SyncEngine o-- SyncPolicy
    SyncEngine o-- MessageRegistry
    SyncEngine ..> ReplicaSession
    MessageRegistry o-- MessageDefinition
    WebSocketTransport ..|> Transport
    PresenceChannel ..> Transport
    SyncEngine ..> Transport

    note for PresenceChannel "efêmero: não passa pelo OpLog nem pelo DocumentState"
    note for LwwStrategy "merge LWW de um campo; não é classe"
    note for TombstoneSetStrategy "presença por addStamp x removeStamp; não é classe"

    cssClass "DocumentRecord,BaseOperation,OpId,LamportClock,OpLog,LWWRegister,DocumentState,OperationKindRegistry,MessageRegistry,MessageDefinition,SyncEngine,Transport,WebSocketTransport,PresenceChannel" frozen
    cssClass "SyncPolicy" hotspot
    cssClass "LwwStrategy,TombstoneSetStrategy" hotspot
    cssClass "ReplicaSession" app
```


## B5a — composição e render

`CollabApp`/`CollabAppConfig`, `SceneHost` e o contrato `Projector`; `SceneProjector` é a projeção do editor e não declara `implements Projector`.

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    class CollabApp {
        +SceneHost host
        +SyncEngine syncEngine
        +start() void
        +stop() void
        +dispose() void
    }
    class CollabAppConfig {
        <<interface>>
        +HTMLElement container
        +SyncReplica replica
        +Session session
    }
    class SceneHost {
        +SceneManager sceneManager
        +RenderEngine renderEngine
        +CameraManager cameraManager
        +onFrame(callback) void
        +start() void
    }
    class SceneManager
    class RenderEngine
    class CameraManager
    class SyncEngine
    class Projector {
        <<interface>>
        +apply(changes) void
        +dispose() void
    }
    class SceneProjector {
        +onMeshRemoved
    }
    class DocumentState
    class ReplicaSession

    CollabApp *-- SceneHost
    CollabApp *-- SyncEngine
    CollabApp ..> CollabAppConfig
    SceneHost *-- SceneManager
    SceneHost *-- RenderEngine
    SceneHost *-- CameraManager
    SceneProjector ..> ReplicaSession
    SceneProjector ..> DocumentState
    SceneProjector ..> SceneManager

    note for Projector "contrato do core; SceneProjector é a projeção do app, sem cláusula implements"
    note for SceneProjector "recebe Change[] via ReplicaSession.onChange"

    cssClass "CollabApp,SceneHost" frozen
    cssClass "CollabAppConfig,Projector" hotspot
    cssClass "SceneProjector,SceneManager,RenderEngine,CameraManager,SyncEngine,DocumentState,ReplicaSession" app
```


## B5b — ferramentas, comandos e formatos

`Tool`/`ToolManager`, `Command` e implementações, `CommandManager` e o registro de formatos com OBJ. `MeshProjector`, `ToolRegistry` e `InteractionRule` não existem no código.

```mermaid
classDiagram
    classDef frozen fill:#dbeafe,stroke:#1e40af,color:#0f172a
    classDef hotspot fill:#fef3c7,stroke:#b45309,color:#0f172a
    classDef app fill:#dcfce7,stroke:#166534,color:#0f172a

    class Tool {
        +activate(object) void
        +deactivate() void
        +createCommand(object, before, after) Command
    }
    class ToolManager {
        +Tool activeTool
        +registerTool(name, tool) void
        +setTool(name, selectedObjects) void
    }
    class CreateObjectTool
    class DeleteTool
    class TransformTool
    class MeshEditTool
    class Command {
        <<abstract>>
        +execute() void
        +undo() void
        +redo() void
    }
    class CommandManager {
        +execute(command) void
        +undo() void
        +redo() void
    }
    class CreatePrimitiveCommand
    class TransformCommand
    class DeleteObjectCommand
    class ColorEditCommand
    class MeshEditCommand
    class FaceExtrudeCommand
    class ImportModelCommand
    class SceneFormat {
        <<interface>>
        +string name
        +string[] extensions
        +parse(contents) ImportedObject[]
    }
    class SceneFormatRegistry {
        +register(format) SceneFormatRegistry
        +forExtension(extension) SceneFormat
    }
    class objFormat
    class ObjImporter {
        +readModel() ImportedObject[]
    }
    class ObjExporter

    ToolManager o-- Tool
    Tool <|-- CreateObjectTool
    Tool <|-- DeleteTool
    Tool <|-- TransformTool
    Tool <|-- MeshEditTool
    CommandManager o-- Command
    Command <|-- CreatePrimitiveCommand
    Command <|-- TransformCommand
    Command <|-- DeleteObjectCommand
    Command <|-- ColorEditCommand
    Command <|-- MeshEditCommand
    Command <|-- FaceExtrudeCommand
    Command <|-- ImportModelCommand
    SceneFormatRegistry o-- SceneFormat
    objFormat ..|> SceneFormat
    ObjImporter ..> SceneFormatRegistry

    cssClass "SceneFormat,SceneFormatRegistry" hotspot
    cssClass "Tool,ToolManager,CreateObjectTool,DeleteTool,TransformTool,MeshEditTool,Command,CommandManager,CreatePrimitiveCommand,TransformCommand,DeleteObjectCommand,ColorEditCommand,MeshEditCommand,FaceExtrudeCommand,ImportModelCommand,objFormat,ObjImporter,ObjExporter" app
```


## O que foi omitido de propósito

- `MeshProjector`, `ToolRegistry`, `InteractionRule`, `CommandFactory`, `PayloadCodec` e a interface `MergeStrategy`: não existem no código; o que existe é `SceneProjector`, `ToolManager`, `Command`/`CommandManager` e `LwwStrategy`/`TombstoneSetStrategy` (objetos constantes).
- `SessionStateReducer`, `MessageValidator` e `ServerOperationEmitter` aparecem como SPI sem implementação; `SnapshotCodec` existe, mas `migrate` ainda não é chamado na leitura.
- Composição só aparece quando há campo/coleção real; `SyncEngine` depende de `ReplicaSession` sem possuí-la.
- `SceneProjector` implementa o comportamento de `Projector`, mas não declara `implements`; o diagrama usa nota em vez de seta de implementação.

## Verificação

- `docs/diagrams/verify.sh`: 100 nomes verificados, 0 inexistentes.
- Sintaxe: todos os 12 `.mmd` renderizados pelo mmdc 11.12.0.
