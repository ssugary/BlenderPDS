# PLANO DE REFATORAÇÃO: BlenderPDS → Framework `collab3d` para Aplicações 3D Colaborativas

> Documento destinado a um **Agente de Implementação (LLM)**. Cada tarefa tem arquivos-alvo, contrato esperado e critério de aceite verificável. Execute as fases em ordem; não pule os gates de regressão.
> Base: `architecture-manifest.md` (commit `1c03688`, branch `main`) e `Sprint 3 de PDS.pdf`.

## 0. Notas prévias

### 0.1 Terminologia (correção)
O enunciado chama os pontos fixos de *hot-spots* e os variáveis de *frozen-spots*. Na literatura de frameworks (Pree) é o inverso: **frozen-spots** = partes fixas e reutilizadas; **hot-spots** = pontos de variação onde a aplicação injeta comportamento. Este plano usa a terminologia correta: *frozen-spots* (fixos) e *hot-spots* (variáveis). Se o relatório da disciplina exigir a nomenclatura do enunciado, troque só os rótulos.

### 0.2 Frozen-spots (não expostos para alteração)
Three.js como motor de render; arquitetura CRDT (log de operações + `seq` global + version vector + dedupe); gestão de usuários/autenticação; gestão de sessões; infraestrutura WebSocket (handshake, lock por sessão, relay, roster, acks).

### 0.3 Hot-spots (os 6 pontos variáveis)

| # | Ponto variável | Backend (SPI Java) | Frontend (TypeScript) |
|---|---|---|---|
| HS1 | Regras de sincronização de estados | `OperationAdmissionPolicy`, `SessionStateReducer`, `SnapshotPolicy` | `MergeStrategy`, `OperationKindDefinition.apply`, `SyncPolicy` |
| HS2 | Conteúdo/estrutura das mensagens | `MessageTypeHandler`, `MessageCatalog` | `MessageRegistry`, `PayloadCodec` |
| HS3 | Validação das mensagens | `MessageValidator`, `OperationKindValidator` | `OperationKindDefinition.validate`, `validateMessage` |
| HS4 | Regras de interação com objetos | (autoridade, via HS1) | `InteractionRule`, `ToolRegistry`, `CommandFactory` |
| HS5 | Regras de conexão entre usuários | `SessionJoinPolicy`, `SessionCapacityPolicy`, `FriendshipPolicy` | `ConnectionRulesView` (só UX) |
| HS6 | Importação/exportação | `SnapshotCodec` (persistência) | `SceneFormatRegistry` (`SceneImporter`/`SceneExporter`) |

### 0.4 Premissas a verificar antes de codar (o manifesto não confirma)
1. Onde ficam os campos específicos de cada `kind` (`geometry`, `color`, `matrix`...) no JSON da operação: dentro de `payload` ou no nível do envelope? Abra `frontend/src/collab/Operation.ts` e `backend/.../websocket/OperationValidator.java`. O plano assume que o envelope é `{id:{siteId,lamport}, author, deps, kind, ...}` e que o servidor persiste o JSON bruto em `session_operations.payload`.
2. Se `UserDetailsServiceImpl` devolve um `UserDetails` customizado com `id` (necessário para a Fase 3).
3. Se `SessionHandshakeInterceptor` consegue ler `Principal` do handshake HTTP (cookie de sessão do Spring Security costuma ser enviado no upgrade).
4. A divergência `ddl-auto=create` vs. docs (`update`).
Registre o resultado em `docs/refactor-notes.md` antes de começar.

### 0.5 Regra de compatibilidade
O editor atual é a primeira aplicação cliente do framework (domínio 1). **Todo contrato REST/WS/schema de operações existente deve continuar funcionando para ele** até a Fase 3. Mudanças de contrato (remoção de `userId` do body/query) só entram na Fase 3, com versão nova e testes atualizados. Crie na Fase 0 testes de caracterização que congelem o comportamento atual.

---

## 1. Visão Geral da Arquitetura do Framework

### 1.1 Estrutura de repositório alvo (monorepo)

```
collab3d/
├── pom.xml                              # parent Maven (packaging pom), Java 21, Spring Boot 4.1.1
├── package.json                         # raiz com npm workspaces (substitui o package.json duplicado)
├── framework/
│   ├── backend-starter/                 # artifact: dev.collab3d:collab3d-spring-boot-starter
│   │   └── src/main/java/dev/collab3d/
│   │       ├── autoconfigure/           # Collab3dAutoConfiguration, Collab3dProperties
│   │       ├── security/                # AuthenticatedActor, ActorResolver, SecurityConfig
│   │       ├── user/                    # User, FriendRequest, UserService (frozen)
│   │       ├── session/                 # Session, SessionParticipant, SessionService (frozen)
│   │       ├── sequencer/               # SessionOperation, OperationSequencer (seq, dedupe)
│   │       ├── ws/                      # SessionSocketHandler, SessionConnectionRegistry, handshake
│   │       └── spi/                     # ★ interfaces dos hot-spots + implementações default
│   ├── core/                            # npm: @collab3d/core
│   │   └── src/
│   │       ├── crdt/                    # OpId, LamportClock, OpLog, VersionVector, DocumentState<T>, merge strategies
│   │       ├── sync/                    # SyncEngine, SyncPolicy
│   │       ├── transport/               # Transport, WebSocketTransport, MessageRegistry
│   │       ├── render/                  # RenderEngine (Three.js), SceneHost, Projector base
│   │       ├── presence/                # PresenceService (canal efêmero)
│   │       ├── api/                     # BackendClient (REST + CSRF)
│   │       ├── events/                  # EventBus
│   │       ├── spi/                     # ★ interfaces dos hot-spots (TS)
│   │       └── createCollabApp.ts       # composition root parametrizado
│   └── react-kit/                       # npm: @collab3d/react-kit (Lobby, Social, Friends, Chat, hooks) — opcional
├── apps/
│   ├── design-editor/                   # domínio 1 (backend app + frontend)
│   ├── turn-game/                       # domínio 2
│   └── avatar-chat/                     # domínio 3
└── docs/
```

### 1.2 Diagrama de dependências (regra: setas só para baixo)

```
 apps/*  (design-editor | turn-game | avatar-chat)
   │  registram: kinds, mensagens, validadores, policies, formatos, tools
   ▼
 @collab3d/react-kit ───►  @collab3d/core          collab3d-spring-boot-starter
   (UI genérica)            (CRDT, sync, render)      (users, sessions, WS, sequencer)
                                   │                            │
                                   ▼                            ▼
                               three.js                    Spring Boot / JPA / PostgreSQL
```

Proibido: `core`/`starter` importarem qualquer coisa de `apps/*`. Imponha por teste (ArchUnit no Java; `eslint-plugin-boundaries` ou script `madge` no TS).

### 1.3 Padrões de projeto por hot-spot

| Padrão | Onde | Justificativa |
|---|---|---|
| **Strategy** | `MergeStrategy`, `OperationAdmissionPolicy`, `SessionJoinPolicy`, `SnapshotPolicy`, `SyncPolicy` | Variação de algoritmo com a mesma interface |
| **Registry + Factory** | `OperationKindRegistry`, `MessageRegistry`, `SceneFormatRegistry`, `ToolRegistry` | Cadastro por chave (`kind`, `type`, `format`) sem `switch` no core |
| **Template Method** | `AbstractMessageTypeHandler` (valida → autoriza → executa → difunde), `Projector<TChange>` base | Core fixa o esqueleto; app preenche os passos |
| **Chain of Responsibility** | cadeia de `MessageValidator` e de `SessionJoinPolicy` | Várias regras compostas, ordenadas por `@Order` |
| **Observer / EventBus** | `SessionLifecycleListener` (Spring events), `EventBus` no front | Desacopla efeitos colaterais |
| **Dependency Injection** | Auto-configuração Spring (`@ConditionalOnMissingBean`); front: objeto `CollabAppConfig` | Substituição de defaults sem tocar o core |
| **Command** | já existente no front (`CommandManager`); mantém e generaliza via `CommandFactory` | Undo/redo por operações compensatórias |
| **Adapter** | Camada `apps/*` adapta o domínio ao framework | Fase 4 |

### 1.4 Modelo central generalizado
O envelope de operação é fixo; **o `kind` deixa de ser enum fechado** e passa a ser chave de registro.

```
Operation = { id: {siteId, lamport}, author, deps[], kind: string, ...campos-do-kind }
```
Envelope validado pelo core. Campos do kind validados e aplicados pela definição registrada. `kind` não registrado é **rejeitado** (secure by default); isso resolve o item “operações rejeitadas por padrão” de forma explícita, e não por acidente (ver Fase 3).

Sessões ganham um **tipo de aplicação**: coluna `sessions.app_type varchar(32) not null default 'design'`. O `SessionSocketHandler` resolve o conjunto de handlers/validadores/policies pelo `app_type` (permite hospedar várias aplicações no mesmo backend; no mínimo, um único tipo por deploy).

---

## 2. Guias de Extensão (APIs dos Hot-spots)

Pacote Java: `dev.collab3d.spi`. Todos os beans abaixo têm **implementação default** registrada com `@ConditionalOnMissingBean`; a aplicação substitui declarando seu próprio `@Bean`/`@Component`. Todas as chamadas que alteram estado ocorrem **dentro do lock por sessão** (`SessionConnectionRegistry.runLocked`).

### Contexto comum (Java)

```java
public record SessionContext(
    long sessionId, String appType, SessionStatus status,
    long hostId, Set<Long> activeParticipantIds, long headSeq) {}

public record Actor(long userId, String nickname, Role role) {}   // sempre do SecurityContext

public record RejectReason(String code, String message) {}         // vira frame error{code}
```

### HS1 — Regras de sincronização de estados

**Objetivo:** a aplicação decide como conflitos são resolvidos, se uma operação é admitida dado o estado, e como/quando snapshots são feitos.

**Backend**

```java
/** Decide, sob lock, se uma operação pode entrar no log. O servidor não interpreta CRDT por padrão. */
public interface OperationAdmissionPolicy {
    /** Retorna empty() para admitir. */
    Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation, SessionStateView state);
    default boolean supports(String appType) { return true; }
}

/** Opcional: dobra o log em um estado do servidor (ex.: de quem é o turno). Só para domínios autoritativos. */
public interface SessionStateReducer<S> {
    S initial(SessionContext ctx);
    S reduce(S current, JsonNode operation, long seq);
    Class<S> stateType();
}

public interface SessionStateView {
    <S> Optional<S> get(Class<S> type);   // estado reduzido atual (vazio se não há reducer)
}

public interface SnapshotPolicy {
    boolean mayWrite(SessionContext ctx, Actor actor, SnapshotEnvelope snapshot);
    int maxBytes();                       // default 1_000_000 (hoje MAX_SNAPSHOT_BYTES)
    OptionalLong compactionThresholdOps();// quando sugerir novo snapshot ao cliente
}
```
Default: `AdmitAllPolicy` (admite tudo que passou na validação), sem reducer, `SnapshotPolicy` = host-only, 1 MB.

**Frontend**

```ts
export type Stamp = OpId;

export interface MergeStrategy<TState, TOp> {
  readonly name: string;                         // 'lww' | 'or-set' | 'counter' | 'append-only' | custom
  empty(): TState;
  apply(state: TState, op: TOp, stamp: Stamp): { state: TState; changed: boolean };
  toJSON(state: TState): unknown;                // para snapshot
  fromJSON(json: unknown): TState;
}

export interface OperationKindDefinition<TOp extends BaseOperation = BaseOperation, TChange = unknown> {
  kind: string;
  validate(op: unknown): op is TOp;                          // HS3
  apply(doc: DocumentDraft, op: TOp, stamp: Stamp): TChange[]; // HS1: usa MergeStrategy por campo
  /** Fábrica para ops locais (Commands chamam isso). */
  create?(input: unknown, ctx: { clock: LamportClock; siteId: string; author: string }): TOp;
}

export interface SyncPolicy {
  chunkSize: number;               // default 200
  maxOpsPerMessage: number;        // default 1000
  snapshotIntervalMs: number | null; // default 15000; null desliga
  flushDebounceMs: number;         // default 0
  onRemoteOps?(ops: BaseOperation[]): void;
}
```
`DocumentState<TChange>` deixa de conhecer `add_object/set_transform/...` e passa a delegar ao `OperationKindRegistry`. Os kinds atuais viram **o pacote `apps/design-editor/src/kinds/`** (`addObject.ts`, `removeObject.ts`, `setTransform.ts`, `changeColor.ts`), usando `LWWRegister` e tombstones já existentes como `MergeStrategy` (`LwwStrategy`, `TombstoneSetStrategy`).

### HS2 — Conteúdo e estrutura das mensagens

**Objetivo:** apps definem novos tipos de frame WS (ex.: `turn_end`, `avatar_pose`) sem editar `SessionSocketHandler`.

**Backend**

```java
public interface MessageTypeHandler {
    String type();                                   // ex.: "avatar_pose"
    Delivery delivery();                             // PERSISTED_OPS | RELAY_EPHEMERAL | UNICAST_REPLY
    void handle(WsMessageContext ctx, JsonNode payload) throws MessageRejectedException;
}

public record WsMessageContext(
    SessionContext session, Actor actor, String connectionId,
    Broadcaster broadcaster,            // broadcast(frame), sendTo(userId, frame), except(self)
    SessionOperationAppender appender)  // appender.append(ops) → atribui seq, dedupe, persiste, difunde
    {}

public enum Delivery { PERSISTED_OPS, RELAY_EPHEMERAL, UNICAST_REPLY }

/** Handler abstrato (Template Method): valida → autoriza → executa → difunde. */
public abstract class AbstractMessageTypeHandler implements MessageTypeHandler {
    @Override public final void handle(WsMessageContext ctx, JsonNode p) {
        validate(ctx, p); authorize(ctx, p); execute(ctx, p);
    }
    protected abstract void validate(WsMessageContext c, JsonNode p);
    protected void authorize(WsMessageContext c, JsonNode p) {}
    protected abstract void execute(WsMessageContext c, JsonNode p);
}
```
Os tipos existentes (`sync_hello`, `sync_ops`, `presence`, `chat`, `scene_snapshot`) são reimplementados como handlers do próprio starter (frozen: `sync_hello`, `sync_ops`, `scene_snapshot`, `session_roster`, `sync_ack`; **substituíveis**: `chat`, `presence`). O `SessionSocketHandler` vira um **despachante**: parse do envelope `{type, ...}` → `MessageCatalog.find(type)` → handler; tipo ausente → `error{UNKNOWN_TYPE}` (comportamento atual preservado).

**Frontend**

```ts
export interface MessageDefinition<TIn = unknown, TOut = TIn> {
  type: string;
  direction: 'send' | 'receive' | 'both';
  validate(payload: unknown): payload is TIn;      // HS3 no cliente
  encode?(value: TOut): unknown;                   // default: identidade
  decode?(raw: unknown): TIn;
  onReceive?(payload: TIn, ctx: CollabContext): void;
}
export interface MessageRegistry {
  register<TIn, TOut>(def: MessageDefinition<TIn, TOut>): void;
  send<T>(type: string, payload: T): void;
}
```
`SyncEngine` usa o registry internamente; `chat`/`presence` passam a ser definições registradas por `react-kit`/`core`.

### HS3 — Validação das mensagens

**Backend** (cadeia ordenada por `@Order`; primeira rejeição interrompe)

```java
public interface MessageValidator {
    boolean supports(String messageType);
    void validate(SessionContext ctx, Actor actor, JsonNode payload) throws InvalidMessageException;
}

/** Validação por kind de operação (substitui os kinds hardcoded em OperationValidator). */
public interface OperationKindValidator {
    String kind();
    void validate(JsonNode operation) throws InvalidOperationException;
}
```
`OperationValidator` do starter passa a:
1. validar o **envelope** (ids ≤ `MAX_ID_LENGTH`, `siteId/lamport`, `deps`, tamanho do lote ≤ `collab3d.sync.max-ops-per-message`);
2. buscar `OperationKindValidator` por `kind`; **kind sem validador registrado → `INVALID_OP`**;
3. rodar a cadeia de `MessageValidator`.

**Frontend**: `validate.ts` é substituído por `validateEnvelope()` (core) + `OperationKindDefinition.validate` + `MessageDefinition.validate`. Um **único conjunto de schemas compartilhado** (Zod ou JSON Schema) evita divergência front/back: gere o JSON Schema por kind em `apps/<app>/schemas/<kind>.json`; o front valida com Ajv/Zod, o back com `networknt json-schema-validator` (implementação genérica `JsonSchemaOperationKindValidator`). Teste de contrato: mesma suíte de casos válidos/inválidos executada nos dois lados.

### HS4 — Regras de interação de objetos

Regra de interação = o que o usuário pode fazer na cena e como isso vira operação. Fica majoritariamente no cliente; o servidor só tem autoridade via HS1.

```ts
export interface InteractionRule {
  id: string;
  /** Pode este usuário/réplica agir sobre este objeto agora? (ex.: lock advisory, turno, dono) */
  canInteract(ctx: InteractionContext, objectId: string, intent: Intent): boolean | Denial;
  /** Transforma gesto em operação(ões) CRDT; null cancela. */
  toOperations(ctx: InteractionContext, intent: Intent): NewOperation[] | null;
}

export interface Tool {                    // já existe; passa a ser registrado
  id: string;
  activate(ctx: ToolContext): void;
  deactivate(): void;
}
export interface ToolRegistry { register(tool: Tool, opts?: { modes?: EditorMode[] }): void; }

export interface CommandFactory<TIntent> {
  create(intent: TIntent, ctx: CommandContext): Command;   // do()/undo() geram ops (undo = op compensatória)
}
```
`Engine.ts` (composition root) deixa de instanciar `TransformTool`, `CreateObjectTool`, etc. diretamente: o app registra tools/rules em `createCollabApp({ tools, interactionRules, commandFactories })`. `SelectionManager`/`PresenceService` mantêm o *advisory lock* como `InteractionRule` default (`AdvisorySelectionLockRule`), substituível (ex.: jogo = só interage com a peça no seu turno).

### HS5 — Regras de conexão entre usuários

**Backend** (cadeia; todas precisam aprovar)

```java
public interface SessionJoinPolicy {
    /** Chamado em SessionService.join e em connectParticipant (handshake WS). */
    JoinDecision decide(SessionContext ctx, Actor joiner, JoinRequest request);
}
public record JoinDecision(boolean allowed, HttpStatus statusIfDenied, String code, String message) {
    public static JoinDecision allow() { return new JoinDecision(true, null, null, null); }
    public static JoinDecision deny(HttpStatus s, String code, String msg) { ... }
}
public record JoinRequest(String codeUsed, boolean viaInvite) {}

public interface SessionCapacityPolicy { int maxParticipants(SessionContext ctx); } // default 4

public interface SessionVisibilityPolicy {                // quem enxerga a sala em /sessions/friends
    boolean visibleTo(SessionContext ctx, Actor viewer);
}
```
Defaults que **reproduzem o comportamento atual**: `HostFriendJoinPolicy` (só amigo do host, ou o próprio host), `FixedCapacityPolicy(4)` configurável por `collab3d.session.max-participants`. Mapeamento de status preservado (404/403/409).

**Frontend**: `ConnectionRulesView` apenas decide o que a UI mostra (ex.: botão “entrar” desabilitado), nunca é fonte de verdade.

### HS6 — Importação e exportação de objetos e cenas

```ts
export interface SceneFormat<TExtra = unknown> {
  id: string;                  // 'obj' | 'glb' | 'board-json' ...
  extensions: string[];
  mime: string;
}
export interface SceneImporter extends SceneFormat {
  /** Converte arquivo em operações CRDT (assim a importação é colaborativa). */
  import(file: File | ArrayBuffer, ctx: ImportContext): Promise<NewOperation[]>;
}
export interface SceneExporter extends SceneFormat {
  export(snapshot: SceneSnapshot, opts?: unknown): Blob | string;
}
export interface SceneFormatRegistry {
  registerImporter(i: SceneImporter): void;
  registerExporter(e: SceneExporter): void;
}
```
`ObjectParser.ts` e `FileExporter.ts` viram `ObjImporter`/`ObjExporter` em `apps/design-editor`. Backlog do projeto (“import .obj via CRDT”, “arquivo de cena baseado no CRDT”) fica atendido pela assinatura `import → NewOperation[]`. No backend, `SnapshotCodec` (opcional) permite a uma app versionar/migrar o JSON do snapshot:

```java
public interface SnapshotCodec {
    int currentSchemaVersion();
    JsonNode migrate(JsonNode snapshot, int fromVersion);   // chamado na reidratação
}
```

---

## 3. Lista de Tarefas de Refatoração (Roadmap em Fases)

Convenções para o agente: um commit por tarefa; mensagem `refactor(phaseX): <id> ...`; após cada tarefa rodar `./mvnw test` (backend) e `npm run build` (frontend). Nunca avance de fase com testes vermelhos.

### Fase 0 — Preparação e rede de segurança

| ID | Tarefa | Aceite |
|---|---|---|
| P0.1 | Registrar premissas §0.4 em `docs/refactor-notes.md` | Documento com resposta objetiva para cada item |
| P0.2 | Teste de caracterização do protocolo WS atual (`sync_hello` → `sync_ops` → `sync_ack` → roster; erros `UNKNOWN_TYPE`, `INVALID_OP`, `SNAPSHOT_TOO_LARGE`) estendendo `SessionWebSocketTest` | Todos verdes no commit base |
| P0.3 | Adicionar ArchUnit ao `pom.xml` (escopo test) e testes: controller/ws não acessam repository (migrar `ControllerLayeringTest`) | Verde |
| P0.4 | Frontend: adicionar Vitest e testes unitários de `LamportClock`, `OpLog`, `LWWRegister`, `DocumentState` (convergência com ordens diferentes de aplicação, idempotência, tombstones) | `npm test` verde; elimina o débito `no_frontend_tests` parcialmente |
| P0.5 | Introduzir Flyway: `V1__baseline.sql` gerado do schema atual; `ddl-auto=validate` | App sobe em banco limpo; testes passam. **Resolve `ddl_auto_destructive`** |
| P0.6 | Converter raiz para npm workspaces (`frontend` → temporariamente `apps/design-editor/web`) e remover deps duplicadas do `package.json` raiz | `npm install` na raiz funciona; resolve `duplicate_root_package` |

### Fase 1 — Extração do Core Backend e parametrização de validação/payloads

| ID | Tarefa | Arquivos / detalhes | Aceite |
|---|---|---|---|
| P1.1 | Criar parent Maven e módulos `framework/backend-starter` e `apps/design-editor/backend`; mover o código atual para o starter mantendo pacotes até o P1.2 | `pom.xml` raiz; `<modules>` | `./mvnw -q verify` verde na raiz |
| P1.2 | Renomear pacote base `com.grupo03.blenderpds` → `dev.collab3d` (starter) e `com.grupo03.blenderpds` (app só com `@SpringBootApplication` + beans do domínio) | Mover `config`, `controller`, `service`, `model`, `repository`, `dto`, `websocket` para o starter | Testes movidos e verdes |
| P1.3 | Criar `Collab3dAutoConfiguration` (`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`) e `Collab3dProperties` (`collab3d.session.max-participants`, `collab3d.sync.*`, `collab3d.snapshot.*`, `collab3d.ws.allowed-origins`, `collab3d.app-type`) | Substituir `WS_ALLOWED_ORIGINS` por `collab3d.ws.allowed-origins` mantendo a variável como fallback | Contexto sobe com defaults sem configuração extra |
| P1.4 | Criar pacote `spi` com **todas** as interfaces da §2 e implementações default | `AdmitAllPolicy`, `HostFriendJoinPolicy`, `FixedCapacityPolicy`, `HostOnlySnapshotPolicy` | Cada default coberto por teste unitário |
| P1.5 | Refatorar `SessionSocketHandler` em **despachante** + handlers: `SyncHelloHandler`, `SyncOpsHandler`, `SnapshotHandler`, `PresenceRelayHandler`, `ChatRelayHandler`; criar `MessageCatalog` (injeta `List<MessageTypeHandler>`; duplicidade de `type()` → falha no boot) | Preservar `MAX_CHAT_LENGTH`, `MAX_VERSION_ENTRIES`, `CHUNK_SIZE` como propriedades | `SessionWebSocketTest` (P0.2) verde sem alterar asserts |
| P1.6 | Refatorar `OperationValidator`: envelope genérico + `OperationKindRegistry` (`List<OperationKindValidator>`). Mover os 4 kinds atuais para `apps/design-editor/backend` como `OperationKindValidator` beans (`AddObjectKindValidator`, ...) | O starter **não** pode conter literais `add_object` etc. (ArchUnit/grep no CI) | Mesmos testes de validação passam; kind desconhecido → `INVALID_OP` |
| P1.7 | Extrair `OperationSequencer` de `SessionServiceImpl.appendOperations` (lock, `seq`, dedupe por `(site_id, lamport)`) e expor `SessionOperationAppender` para handlers | Sem mudança de schema | Teste de concorrência: 2 conexões, 500 ops cada, `seq` contíguo e sem duplicatas |
| P1.8 | Invocar cadeia `OperationAdmissionPolicy` e (se houver) `SessionStateReducer` dentro de `runLocked`, antes de persistir; rejeição → `error{OP_REJECTED}` e **nenhuma** persistência | `SessionStateView` mantido em memória por sessão, reconstruído do log ao abrir | Teste com policy fake que rejeita kind X |
| P1.9 | Cadeia `SessionJoinPolicy`/`SessionCapacityPolicy`/`SessionVisibilityPolicy` usada por `SessionService.join`, `connectParticipant` e `friendsSessions` | Defaults replicam regra atual | `SessionControllerTest` inalterado e verde; teste novo com policy customizada |
| P1.10 | Adicionar `sessions.app_type` via migração Flyway `V2` (default `'design'`) e `SessionCreateDto.appType` opcional (ignorado se o deploy fixa o tipo) | | Migração aplica em base existente |
| P1.11 | Eventos: publicar `SessionCreatedEvent`, `ParticipantJoinedEvent`, `ParticipantLeftEvent`, `SessionEndedEvent` (já existe) e interface `SessionLifecycleListener` | `@TransactionalEventListener(AFTER_COMMIT)` | Teste de listener |
| P1.12 | Corrigir `syncSince`/`syncSinceSeq`: query `findBySessionIdAndSeqGreaterThanOrderBySeq(sessionId, seq, Pageable)`; usar no `sync_hello` com paginação por `CHUNK_SIZE` (resolve `linear_scans` e o `stub_or_dead` de `syncSinceSeq`) | Índice: `uk_session_operation_seq` já cobre | Teste com 10k ops: memória estável |

**Gate Fase 1:** o `apps/design-editor/backend` roda o editor atual contra o frontend **inalterado** (REST+WS idênticos).

### Fase 2 — Extração do Core Frontend, CRDT genérico e motor Three.js

| ID | Tarefa | Detalhes | Aceite |
|---|---|---|---|
| P2.1 | Criar `framework/core` (`@collab3d/core`) com build (Vite lib mode ou `tsup`), `exports` e `peerDependencies: three, react?` (core não depende de React) | `tsconfig` strict herdado | `npm run build -w @collab3d/core` gera `dist` com `.d.ts` |
| P2.2 | Mover para o core: `OpId`, `LamportClock`, `OpLog`, `LWWRegister`, `VersionVector`, `EventBus`, `Transport`, `WebSocketTransport`, `Backend.ts` (cliente REST/CSRF, baseURL configurável) | `WebSocketTransport` recebe `urlBuilder` (sem `userId` na query após a Fase 3) | Testes P0.4 movidos e verdes |
| P2.3 | Definir `BaseOperation`, `OperationKindRegistry`, `MergeStrategy`, `LwwStrategy`, `TombstoneSetStrategy` (extraídos de `DocumentState`) | `DocumentState` vira `DocumentState<TChange>(registry)`; `apply()` retorna `TChange[]` produzidos pelo kind | Suíte de convergência com kinds do editor passa |
| P2.4 | Mover os 4 kinds atuais para `apps/design-editor/web/src/kinds/*` como `OperationKindDefinition` | O core não contém `add_object`/`set_transform`/... (script de verificação) | `grep -R "add_object" framework/core` vazio |
| P2.5 | `Projector<TChange>` base + `SceneHost` (cena/câmera/render loop) no core; `SceneProjector` do editor passa a ser subclasse (`Mesh`s e mapa `objectId↔Mesh`) | Manter regra: projetor é o **único escritor** de conteúdo compartilhado | Testes visuais manuais + teste unitário de projeção com cena fake |
| P2.6 | `RenderEngine` e `CameraManager` no core; `SceneManager`, `SelectionManager`, `RaycasterManager`, `InputManager` ficam no core só se genéricos — caso contrário vão para o app | Critério: depende de conceito de “objeto editável”? → app | Compila; sem import cruzado core→app |
| P2.7 | `PresenceService` genérico: canal efêmero tipado (`PresenceChannel<T>`), taxa limitada (`throttleMs`), expiração | `RemoteSelectionView` fica no app | Teste de expiração |
| P2.8 | `MessageRegistry` e `SyncPolicy` no `SyncEngine`; `chat`, `presence` registrados como definições | Remover `switch` por `type` | Testes de `SyncEngine` com `Transport` fake |
| P2.9 | `createCollabApp(config)` — substitui a montagem manual de `Engine.ts`:  | ver snippet abaixo | Editor sobe usando só `createCollabApp` |
| P2.10 | `SceneFormatRegistry`; migrar `ObjectParser`→`ObjImporter` (retorna `NewOperation[]`) e `FileExporter`→`ObjExporter` | Import passa a ser colaborativo (resolve item do backlog) | Importar `.obj` em sessão com 2 réplicas converge |
| P2.11 | `framework/react-kit`: Lobby, Social, FriendsPanel, ChatPanel, Toast, hooks (`useBusEvent`, `useSocial`, `useSession`) sem dependência de domínio | `TimelinePanel` e `Toolbar`/`ColorPicker` ficam no app | Editor usa react-kit |

```ts
// framework/core/src/createCollabApp.ts
export interface CollabAppConfig<TChange> {
  appType: string;                                   // 'design' | 'turn-game' | 'avatar-chat'
  api: { baseUrl: string; wsPath?: string };
  kinds: OperationKindDefinition[];                  // HS1/HS3
  messages?: MessageDefinition[];                    // HS2
  sync?: Partial<SyncPolicy>;                        // HS1
  projector: (host: SceneHost) => Projector<TChange>;
  tools?: Tool[];                                    // HS4
  interactionRules?: InteractionRule[];              // HS4
  formats?: { importers?: SceneImporter[]; exporters?: SceneExporter[] }; // HS6
  presence?: PresenceChannelConfig<unknown>[];
}
export interface CollabApp {
  start(container: HTMLElement, session: SessionHandle): void;
  dispose(): void;                                   // obrigatório (StrictMode monta 2x)
  bus: EventBus;
}
export function createCollabApp<T>(cfg: CollabAppConfig<T>): CollabApp;
```

**Gate Fase 2:** `npm run build` (tsc strict) + `npm test` verdes; editor funciona ponta a ponta com o backend da Fase 1.

### Fase 3 — Débitos técnicos críticos e segurança (prioridade máxima; pode rodar em paralelo à Fase 2 quando só toca o backend)

#### P3.1 Identity spoofing (`actor_identity_from_request`)
1. Criar `AppUserDetails implements UserDetails` com `id`, e fazer `UserDetailsServiceImpl` devolvê-lo. Criar `ActorResolver`:
```java
public interface ActorResolver { Actor current(); }  // lê SecurityContextHolder; 401 se ausente
```
2. Remover `userId`/`hostId` de `SessionCreateDto` e `SessionJoinDto`; controllers chamam `service.create(actor, ...)`, `service.join(sessionId, actor)`. Aceitar o campo antigo por uma versão **ignorando-o** (e logando `WARN` se divergir do principal → `403`).
3. `UserController`: `PUT/DELETE /users/{id}`, `/users/{id}/friend-requests/**`, `/users/{id}/friends/**` exigem `id == actor.userId()` (ou `ADMIN` onde fizer sentido). Use `@PreAuthorize("@authz.isSelf(#id)")` com `@EnableMethodSecurity`. `GET /users/{id}`: devolver DTO público (sem e-mail) se não for o próprio.
4. WebSocket: `SessionHandshakeInterceptor` obtém o usuário do `Principal` do handshake e **ignora** `?userId=`; se existir e divergir → `403`. Guarde `userId` nos atributos da sessão WS; o handler jamais lê identidade do payload (`author` das operações é **sobrescrito** pelo servidor com o ator; `presence`/`chat` carimbados pelo servidor).
5. Frontend: remover `userId` de `WebSocketTransport.url` e dos bodies.
6. `/sessions/open/{userId}`, `/sessions/friends/{userId}` → trocar por `/sessions/open/me` e `/sessions/friends` (mantendo as rotas antigas por uma versão, validando `userId == ator`).
7. **Aceite:** testes novos: usuário A autenticado tenta criar sala com `hostId` de B → ignorado/403; A abre WS com `userId` de B → 403; A faz `PUT /users/{B}` → 403; operação com `author` forjado é persistida com `author=A`.

#### P3.2 Operações genéricas/personalizadas rejeitadas por padrão
- Hoje `mesh_edit` e `undo` são rejeitadas por *flags* `default false` e declaradas sem uso. Decisão: **o core não tem kinds embutidos**; kind só é aceito se houver `OperationKindDefinition` (front) e `OperationKindValidator` (back).
- Remover `mesh_edit`/`undo` do enum/tipos do core. No `design-editor`:
  - `undo`: **não** implementar como op; implementar *undo/redo* por **operação compensatória** emitida pelo `Command.undo()` (ex.: `set_transform` com o valor anterior). Evita undo global com semântica ambígua em CRDT.
  - `mesh_edit`: implementar como kind `set_mesh` (LWW do buffer de geometria por objeto, com limite de tamanho por operação via propriedade `design.max-mesh-bytes`), validado por JSON Schema nos dois lados. Habilita o backlog “`mesh_edit` via CRDT”.
- Remover código morto: `AddObjectCommand`, `SessionParticipantRepository.deleteBySessionIdAndUserId`, starter `oauth2-client` (ou configurar), e atualizar `docs/` (`FaceExtrudeCommand`, WebRTC).
- **Aceite:** kind não registrado → `INVALID_OP` com teste; `set_mesh` converge entre 2 réplicas.

#### P3.3 Reidratação por snapshot
Ciclo alvo:
1. **Formato** (`SnapshotEnvelope`, JSON): `{ schemaVersion, appType, baseSeq, versionVector, state, checksum }`, onde `state` = `DocumentState.toSnapshot()` **incluindo carimbos LWW e tombstones** (sem isso o merge pós-snapshot diverge).
2. **Persistência:** migração Flyway `V3`: `sessions.snapshot_seq bigint null`, `sessions.snapshot_version int null` (mantém `scene_snapshot text`).
3. **Escrita (`scene_snapshot`):** servidor valida via `SnapshotPolicy.mayWrite` (default: host), tamanho ≤ `maxBytes`, `baseSeq ≤ headSeq` e **monótono** (`baseSeq ≥ snapshot_seq` atual), checksum (SHA-256 do `state` canônico). Rejeição → `SNAPSHOT_REJECTED`.
4. **Leitura no `sync_hello`:** se `cliente.vv` vazio/ausente e existe snapshot → servidor envia frame novo `sync_snapshot {snapshot}` seguido de `sync_ops` com `seq > baseSeq` (paginado). Cliente com `vv` não vazio segue o caminho atual (catch-up). Adicionar `sync_snapshot` ao catálogo de mensagens (**mudança aditiva do protocolo**, documentar em `docs/ws-protocol.md`).
5. **Cliente:** `DocumentState.fromSnapshot(json)` + `OpLog.seedFromSnapshot(vv)`; o `SceneProjector` recebe uma “mudança inicial completa” (`Change[]` sintético). Se `schemaVersion` < atual, o `SnapshotCodec` migra.
6. **Compactação opcional:** a cada `snapshotIntervalMs` o host envia snapshot; o servidor **não** apaga ops (log é fonte de verdade); poda é decisão futura.
7. **Aceite:** teste E2E: sessão com 5k ops → cliente novo conecta e só recebe snapshot + ops posteriores; estado final idêntico ao do replay completo (comparação de estado serializado). Teste de corrupção: checksum inválido → rejeitado.

#### P3.4 Demais débitos do manifesto

| Débito | Ação | Aceite |
|---|---|---|
| `mixed_jackson_packages` | Trocar import em `UserDto` para `tools.jackson.annotation` ou, se não existir em Jackson 3 para esse módulo, declarar a dependência de anotações explicitamente; verificar serialização de `UserDto` em teste | Teste de JSON de `UserDto` |
| `user_enumeration` | Substituir `GET /users` (lista tudo) por `GET /users/search?nickname=` com mínimo de 3 caracteres, paginação e rate limit; remover e-mail do DTO público | Teste: lista completa não é mais obtível |
| `hardcoded_dev_credentials` | `compose.yaml` lê `${POSTGRES_PASSWORD:?}` de `.env` (commit de `.env.example`) | `git grep` sem senha literal |
| `no_ci` | `.github/workflows/ci.yml`: job backend (Java 21, Docker disponível, `./mvnw verify`), job frontend (Node 22, `npm ci`, `npm run build`, `npm test`) | Pipeline verde |
| `in_memory_registry` | Documentar limitação (single-instance) e criar a SPI `SessionBroadcaster` com implementação `InMemorySessionBroadcaster` (default); implementação Redis/broker fica fora de escopo | Interface criada; nenhum código usa a classe concreta |
| `stale_package_description`, `doc_code_drift` | Corrigir `description` e docs | Revisão |
| Limites WS | Adicionar rate limit por conexão (`RateLimitPolicy` SPI: default 50 msg/s) — essencial para `avatar_pose` | Teste: excedente → `error{RATE_LIMITED}` e descarte |

### Fase 4 — Camadas de adaptadores e exemplos práticos

#### 4.1 Aplicação 1 — Editor de Design Colaborativo (`apps/design-editor`)
É o editor atual **reescrito como cliente do framework**.
- **Backend:** apenas `@SpringBootApplication`, beans `OperationKindValidator` (4 kinds + `set_mesh`), `application.properties` com `collab3d.*`.
- **Frontend:** `main.tsx` chama `createCollabApp({ appType:'design', kinds:[addObject, removeObject, setTransform, changeColor, setMesh], projector: h => new MeshProjector(h), tools:[TransformTool, CreateObjectTool, DeleteTool, MeshEditTool], interactionRules:[new AdvisorySelectionLockRule()], formats:{ importers:[objImporter], exporters:[objExporter] }})`.
- **Aceite:** paridade funcional com a versão pré-refatoração (checklist manual: criar, mover, colorir, excluir, import/export, 2 usuários, reconectar, undo/redo).

#### 4.2 Aplicação 2 — Jogo Multiplayer em Turnos (`apps/turn-game`) — exemplo: jogo da velha 3D / xadrez simplificado
Demonstra **estado sequenciado + autoridade do servidor** (HS1, HS2, HS3, HS5).
- **Kinds** (CRDT): `place_piece {cell, piece}` (LWW por célula, imutável após definido), `end_turn {}`, `resign {}`, `game_over {winner}` (emitido só pelo servidor).
- **Backend:**
  - `TurnState` (record) + `TurnStateReducer implements SessionStateReducer<TurnState>` (jogador atual, tabuleiro, vencedor).
  - `TurnAdmissionPolicy implements OperationAdmissionPolicy`: `place_piece` só do jogador da vez, célula vazia, jogo não encerrado → senão `OP_REJECTED{NOT_YOUR_TURN|CELL_TAKEN|GAME_OVER}`. Ao detectar vitória, o `SessionOperationAppender` anexa `game_over` (op do servidor com `author=system`).
  - `TwoPlayersPolicy implements SessionCapacityPolicy` (=2) e `InviteCodeJoinPolicy implements SessionJoinPolicy` (exige código; sem exigência de amizade). Espectadores: `SessionVisibilityPolicy` permite, `AdmissionPolicy` nega ops.
  - Mensagem nova `turn_timer` (RELAY_EPHEMERAL) para cronômetro.
- **Frontend:** `BoardProjector` (Three.js: grade 3x3 + peças), `PlaceMoveRule implements InteractionRule` (`canInteract` consulta `TurnState` local; apenas feedback), tool `PickCellTool`. O servidor continua sendo a autoridade; o cliente é otimista e reconcilia com `sync_ack`/`OP_REJECTED` (remover op local rejeitada via `OpLog.rollback(opId)` — adicionar esse método ao core na Fase 2 como parte de P2.3).
- **Aceite:** partida completa entre 2 clientes; tentativa de jogada fora de turno é rejeitada e revertida na UI; reconexão no meio da partida restaura o tabuleiro (snapshot + ops).

#### 4.3 Aplicação 3 — Conversação Online Privada com Avatares 3D (`apps/avatar-chat`)
Demonstra **presença efêmera, sync leve e chat** (HS2, HS5; CRDT só para o essencial).
- **Separação de canais:**
  - Persistido/CRDT: `set_avatar {model, color, name}` (LWW), `chat_message {id, text}` (kind **append-only** com `AppendOnlyStrategy` → histórico persistente opcional `avatar.persist-chat=true`).
  - Efêmero (fora do log, `RELAY_EPHEMERAL`): `avatar_pose {x,y,z,ry}` a ≤ 10–15 Hz, `emote {name}`, `typing {on}`.
- **Backend:**
  - `AvatarPoseHandler extends AbstractMessageTypeHandler` (`type()="avatar_pose"`, validação numérica/limites de cena, carimbo do ator, difusão para os demais sem persistir).
  - `PrivateRoomJoinPolicy` (convite por código **e** amizade com o host, ou lista de permitidos), `FixedCapacityPolicy(8)`.
  - `RateLimitPolicy` específico (pose: 20 msg/s; chat: 2 msg/s).
  - `SnapshotPolicy` desabilitada para pose (nada a persistir); snapshot só de `set_avatar`.
- **Frontend:** `AvatarProjector` (mesh por usuário, interpolação/dead-reckoning para suavizar poses), `PresenceChannel<AvatarPose>` do core com `throttleMs=70`, `MovementRule implements InteractionRule` (limites da sala), `ChatPanel` do react-kit.
- **Aceite:** 4 clientes veem avatares movendo-se suavemente; pose não cresce `session_operations` (teste: contagem de linhas inalterada); chat respeita rate limit.

#### 4.4 Matriz de cobertura dos hot-spots por aplicação

| Hot-spot | design-editor | turn-game | avatar-chat |
|---|---|---|---|
| HS1 Sync | LWW + tombstones | LWW + `TurnStateReducer` autoritativo | LWW (`set_avatar`) + canal efêmero |
| HS2 Mensagens | defaults | `turn_timer` | `avatar_pose`, `emote`, `typing` |
| HS3 Validação | schemas dos 5 kinds | regras de jogada | limites de pose, tamanho de chat |
| HS4 Interação | lock advisory de seleção | `PlaceMoveRule` (turno) | `MovementRule` |
| HS5 Conexão | amigo do host, 4 | convite, 2 + espectadores | convite + amizade, 8 |
| HS6 Import/Export | `.obj` (e cena CRDT) | `board-json` (partida) | `avatar-json` (perfil) |

---

## 4. Instalação e Distribuição

### 4.1 Backend (Maven)
Coordenadas: `dev.collab3d:collab3d-spring-boot-starter:0.1.0`.

Publicação local (desenvolvimento):
```bash
./mvnw -pl framework/backend-starter -am install        # instala no ~/.m2
```
Uso na aplicação:
```xml
<dependency>
  <groupId>dev.collab3d</groupId>
  <artifactId>collab3d-spring-boot-starter</artifactId>
  <version>0.1.0</version>
</dependency>
```
```properties
# application.properties da app
collab3d.app-type=turn-game
collab3d.session.max-participants=2
collab3d.sync.chunk-size=200
collab3d.sync.max-ops-per-message=1000
collab3d.snapshot.max-bytes=1000000
collab3d.ws.allowed-origins=http://localhost:5173
```
A app registra seus hot-spots como beans:
```java
@Configuration
class TurnGameConfig {
  @Bean OperationKindValidator placePieceValidator() { return new PlacePieceKindValidator(); }
  @Bean OperationAdmissionPolicy turnAdmission() { return new TurnAdmissionPolicy(); }
  @Bean SessionStateReducer<TurnState> turnReducer() { return new TurnStateReducer(); }
  @Bean SessionCapacityPolicy capacity() { return ctx -> 2; }
  @Bean SessionJoinPolicy join() { return new InviteCodeJoinPolicy(); }
}
```
Dependências do starter: `spring-boot-starter-webmvc`, `-data-jpa`, `-security`, `-websocket`, `-mail`, `-validation`, `-actuator`, `flyway-core` + `flyway-database-postgresql`, `postgresql` (runtime). A app não precisa redeclará-las.

### 4.2 Frontend (npm workspaces)
Desenvolvimento local: workspaces na raiz (`"workspaces": ["framework/*", "apps/*/web"]`); `npm install` na raiz faz o link simbólico.
Distribuição fora do monorepo (sem registry público):
```bash
npm run build -w @collab3d/core -w @collab3d/react-kit
npm pack -w @collab3d/core         # gera collab3d-core-0.1.0.tgz
# na app externa:
npm install ../caminho/collab3d-core-0.1.0.tgz three
```
Uso:
```ts
import { createCollabApp } from '@collab3d/core';
import { ChatPanel, Lobby } from '@collab3d/react-kit';
const app = createCollabApp({ appType: 'avatar-chat', api: { baseUrl: '/api' }, kinds, messages, projector, /* ... */ });
```
Vite da app: manter proxy `/api` (com rewrite) e `/ws` (`ws:true`) para `BACKEND_URL`, como hoje.

### 4.3 Versionamento e compatibilidade
- SemVer. Mudanças nos 7 limites de contrato (REST, WS, schema de ops, schema de DB, camadas, `sessions.user_id`, single-instance) incrementam *minor* (aditivas) ou *major* (quebra), sempre com nota em `CHANGELOG.md`.
- `sessions.user_id` permanece (compat). O novo nome lógico `host` é só no modelo Java (`@JoinColumn(name="user_id")`).

### 4.4 Checklist final de Definition of Done
- [ ] `grep` não encontra `add_object|set_transform|change_color|remove_object` em `framework/`.
- [ ] Nenhum `userId`/`hostId` aceito de payload/query/path como identidade (testes de spoofing verdes).
- [ ] `ddl-auto=validate` + Flyway; sem `create`.
- [ ] Reidratação por snapshot comprovada por teste E2E.
- [ ] Os 3 apps rodam com `./mvnw spring-boot:run` + `npm run dev` documentados no README de cada um.
- [ ] CI verde (backend + frontend).
- [ ] `docs/` atualizados: arquitetura do framework, protocolo WS (incluindo `sync_snapshot`, `RATE_LIMITED`), guia “como criar uma nova aplicação em 6 passos” (um passo por hot-spot).


---

# APÊNDICES (continuação do plano)

> Complementam as seções 0–4. Em caso de conflito com um snippet da §2, **prevalece o apêndice** (divergências marcadas com ⚠).

## 5. Mapa de migração de arquivos (origem → destino)

> Use esta tabela como fonte única para saber onde cada arquivo do manifesto (`1c03688`) vai parar. **Nunca** copie e apague no mesmo commit: mova com `git mv` para preservar histórico. Onde a tabela diz **SPLIT**, o arquivo é dividido: a parte genérica vai para o framework e a parte de domínio para o app.

### 5.1 Backend (`backend/blenderpds/src/main/java/com/grupo03/blenderpds/…`)

| Origem | Destino | Obs. |
|---|---|---|
| `config/SecurityConfig` | `starter: dev.collab3d.security.SecurityConfig` | Passa a expor `ActorResolver` (P3.1) |
| `config/WebSocketConfig` | `starter: dev.collab3d.ws.WebSocketConfig` | Origins vêm de `Collab3dProperties` |
| `config/JpaAuditingConfig` | `starter: dev.collab3d.autoconfigure` | |
| `controller/AuthController`, `UserController`, `SessionController`, `ApiExceptionHandler` | `starter: dev.collab3d.api` | Contratos REST congelados até a Fase 3 |
| `service/*` (interfaces, `SessionEndedEvent`, `SessionOperationInput`) | `starter: dev.collab3d.user` / `.session` | `EmailService` fica no starter |
| `service/implementation/SessionServiceImpl` | **SPLIT** → `SessionServiceImpl` (ciclo de vida) + `OperationSequencer` (P1.7) | `appendOperations` sai daqui |
| `service/implementation/UserDetailsServiceImpl` | `starter: dev.collab3d.security` | Devolve `AppUserDetails` (P3.1) |
| `model/*`, `repository/*`, `dto/*` | `starter` (mesmos subpacotes) | `SessionOperation.kind` continua `varchar(32)` |
| `websocket/SessionSocketHandler` | **SPLIT** → `ws/SessionSocketHandler` (despachante) + `ws/handler/*` (P1.5) | |
| `websocket/SessionConnectionRegistry`, `SessionConnection`, `SessionHandshakeInterceptor` | `starter: dev.collab3d.ws` | Registry vira implementação de `SessionBroadcaster` |
| `websocket/OperationValidator` | **SPLIT** → `starter: sequencer/OperationEnvelopeValidator` + `apps/design-editor/backend: kinds/*KindValidator` (P1.6) | Literais `add_object` etc. saem do starter |
| `BlenderpdsApplication` | `apps/design-editor/backend` | Único arquivo que fica "do app" além dos beans de domínio |
| `src/test/java/**` | Acompanham o código movido; `SessionWebSocketTest` fica no starter (usa kinds de teste) e uma cópia de fumaça no app | Kinds de teste: `test_set` / `test_add` registrados só no escopo de teste do starter |

### 5.2 Frontend (`frontend/src/…`)

| Origem | Destino | Decisão |
|---|---|---|
| `api/Backend.ts` | `core/api/BackendClient.ts` | `baseUrl` injetado |
| `collab/Operation.ts` | **SPLIT** → `core/crdt/BaseOperation.ts` + `apps/design-editor/web/src/kinds/*` | Remove `mesh_edit`/`undo` |
| `collab/OpId.ts`, `LamportClock.ts`, `OpLog.ts`, `LWWRegister.ts`, `ReplicaSession.ts`, `SceneSnapshot.ts` | `core/crdt/` | `ReplicaSession` ganha `rollback(opId)` |
| `collab/DocumentState.ts` | **SPLIT** → `core/crdt/DocumentState.ts` (genérico) + kinds no app | Ver §6.2 |
| `collab/validate.ts` | **SPLIT** → `core/crdt/validateEnvelope.ts` + `OperationKindDefinition.validate` | |
| `collab/SyncEngine.ts` | `core/sync/` | Recebe `MessageRegistry` e `SyncPolicy` |
| `collab/SceneProjector.ts` | `apps/design-editor/web/src/projection/MeshProjector.ts` (estende `Projector<TChange>` do core) | |
| `collab/PresenceService.ts` | `core/presence/` | Genérico (`PresenceChannel<T>`) |
| `collab/RemoteSelectionView.ts` | app (design-editor) | |
| `core/Engine.ts` | **SPLIT** → `core/createCollabApp.ts` + `apps/design-editor/web/src/main.tsx` | |
| `core/EventBus.ts`, `core/RenderEngine.ts` | `core/events`, `core/render` | |
| `core/ObjectParser.ts`, `core/utils/FileExporter.ts` | app: `ObjImporter` / `ObjExporter` | HS6 |
| `core/utils/FileLoader.ts`, `Id.ts` | `core/utils/` | |
| `core/controllers/ActionRouter`, `SelectionController`, `TransformGestureController` | app | Dependem de "objeto editável" |
| `entity/HalfEdge*`, `EditorMode`, `SelectionStrategy` | app | |
| `entity/Navigation` | `core/render/` (se só mexe na câmera) | Se referenciar seleção → app |
| `manager/CameraManager`, `RaycasterManager`, `InputManager`, `ToolManager`, `CommandManager` | `core/` | `ToolManager` vira `ToolRegistry` |
| `manager/SceneManager` | `core/render/SceneHost.ts` | Mantém o mapa `objectId↔Object3D` como utilitário opcional |
| `manager/SelectionManager`, `EditorModeManager` | app | Resolve a ambiguidade de P2.6: **só vai para o core o que não conhece "objeto selecionável"** |
| `tool/*`, `command/*` | app | `CreatePrimitiveCommand`, `DeleteObjectCommand`, `ColorEditCommand`, `TransformCommand`, `MeshEditCommand`; `AddObjectCommand` é código morto → apagar (P3.2) |
| `network/Transport`, `WebSocketTransport`, `Session` | `core/transport/` | |
| `react/ui/Lobby`, `MenuPage`, `HostPage`, `JoinPage`, `SocialPage`, `SocialContext`, `UseSocial`, `FriendsPanel`, `ChatPanel`, `Toast` | `react-kit/` | |
| `react/ui/AppRoutes`, `TimelinePanel`, `Toolbar`, `ColorPicker`, `EditorOverlay` | app | |
| `react/Viewport3D` | `react-kit/CollabViewport.tsx` (monta/desmonta o `CollabApp`, chama `dispose()`) | StrictMode monta 2x |
| `Main.tsx` | app | `SNAPSHOT_INTERVAL_MS` sai daqui e vira `SyncPolicy.snapshotIntervalMs` |

---

## 6. Complementos aos Guias de Extensão (snippets que faltavam)

> Estes trechos **completam** a §2. Onde divergirem de um snippet da §2, **vale este apêndice** (as divergências estão marcadas com ⚠).

### 6.1 Backend

**⚠ Ajuste ao "Contexto comum"**: a ordem de entrada importa (jogos precisam saber quem é o 2º jogador).

```java
public record SessionContext(
    long sessionId, String appType, SessionStatus status,
    long hostId,
    List<Long> participantIdsByJoinOrder,   // ativos, ordenados por joined_at (antes era Set)
    long headSeq) {}
```

**⚠ Novo SPI: operações geradas pelo servidor** (necessário para `game_over`):

```java
/** Chamado sob lock, depois que as ops do lote foram admitidas, persistidas e reduzidas. */
public interface ServerOperationEmitter {
    List<ObjectNode> followUps(SessionContext ctx, List<AppendedOperation> appended, SessionStateView state);
    default boolean supports(String appType) { return true; }
}
public record AppendedOperation(long seq, Long authorId, JsonNode operation) {}
```

`SessionOperationAppender` (injetado em `WsMessageContext`):

```java
public interface SessionOperationAppender {
    /** Ops de cliente. Sobrescreve `author` com o ator autenticado (P3.1), atribui seq, deduplica. */
    AppendResult append(List<JsonNode> ops);
    /** Ops do servidor: id={siteId:"server",lamport:seq}, author=null. Passam pelo OperationKindValidator, NÃO pela AdmissionPolicy. */
    AppendResult appendSystem(List<ObjectNode> ops);
}
public record AppendResult(List<AppendedOperation> accepted, List<RejectedOperation> rejected) {}
public record RejectedOperation(OpRef ref, RejectReason reason) {}
public record OpRef(String siteId, long lamport) {}
```

**Semântica de lote (decisão fechada):**
1. HS3 (validação de envelope + kind) é **atômica por lote**, como hoje: uma op inválida → `error{INVALID_OP}` e nada é persistido.
2. HS1 (admissão) é **por operação, em ordem**, atualizando o reducer entre uma op e a seguinte (o 2º `place_piece` do mesmo lote vê o tabuleiro após o 1º).
3. Op rejeitada é descartada; ops aceitas anteriores permanecem. Op cujo `deps` contenha uma op rejeitada é rejeitada com `DEP_REJECTED`.
4. Há **um** frame de resposta de erro por lote: `error{code:"OP_REJECTED", refs:[{siteId,lamport,reason}]}` (mudança **aditiva**: o campo `refs` é novo; ver §8).

**Completar `JoinDecision`** (a §2 deixou `{ ... }`):

```java
public record JoinDecision(boolean allowed, HttpStatus statusIfDenied, String code, String message) {
    public static JoinDecision allow() { return new JoinDecision(true, null, null, null); }
    public static JoinDecision deny(HttpStatus status, String code, String message) {
        return new JoinDecision(false, status, code, message);
    }
}
```
A cadeia (`List<SessionJoinPolicy>`, ordenada por `@Order`) para na primeira negação; o `ApiExceptionHandler` mapeia `statusIfDenied` mantendo 404/403/409.

**Contrato do `Broadcaster`:**

```java
public interface Broadcaster {
    void broadcast(JsonNode frame);
    void broadcastExcept(String connectionId, JsonNode frame);
    void sendTo(long userId, JsonNode frame);
    void reply(JsonNode frame);                    // só para a conexão de origem
}
```

**Despachante** (`SessionSocketHandler` depois do P1.5). Regra de locking: `PERSISTED_OPS` roda dentro de `registry.runLocked(sessionId, …)`; `RELAY_EPHEMERAL` roda **fora** do lock (não altera estado persistido e evita contenção a 20 Hz); `UNICAST_REPLY` fora do lock.

```java
@Override
protected void handleTextMessage(WebSocketSession ws, TextMessage msg) {
    JsonNode root;
    try { root = mapper.readTree(msg.getPayload()); }
    catch (Exception e) { sendError(ws, "INVALID_MESSAGE"); return; }

    String type = root.path("type").asString(null);          // Jackson 3: asString() (antes asText()) — confirmar na versão do projeto
    Optional<MessageTypeHandler> h = catalog.find(type);
    if (h.isEmpty()) { sendError(ws, "UNKNOWN_TYPE"); return; }

    Actor actor = actorOf(ws);                                // vem dos atributos do handshake (P3.1)
    if (!rateLimiter.tryAcquire(connectionId(ws), type)) { sendError(ws, "RATE_LIMITED"); return; }

    try {
        for (MessageValidator v : validators)                 // cadeia @Order
            if (v.supports(type)) v.validate(sessionCtx(ws), actor, root);
        Runnable run = () -> h.get().handle(wsCtx(ws, actor), root);
        if (h.get().delivery() == Delivery.PERSISTED_OPS) registry.runLocked(sessionId(ws), run); else run.run();
    } catch (InvalidMessageException | InvalidOperationException e) { sendError(ws, e.code()); }
      catch (MessageRejectedException e) { sendError(ws, e.code()); }
      catch (RuntimeException e) { log.error("ws", e); sendError(ws, "INTERNAL_ERROR"); }
}
```

**`MessageCatalog`** (falha no boot se houver `type()` duplicado):

```java
public class MessageCatalog {
    private final Map<String, MessageTypeHandler> byType;
    public MessageCatalog(List<MessageTypeHandler> handlers) {
        Map<String, MessageTypeHandler> m = new HashMap<>();
        for (var h : handlers)
            if (m.put(h.type(), h) != null) throw new IllegalStateException("Duplicate WS type: " + h.type());
        this.byType = Map.copyOf(m);
    }
    public Optional<MessageTypeHandler> find(String type) { return Optional.ofNullable(byType.get(type)); }
}
```

**Validador de envelope** (`OperationEnvelopeValidator`, no starter; não contém nenhum `kind` literal):

```java
public void validateBatch(JsonNode ops) {
    if (!ops.isArray() || ops.size() == 0 || ops.size() > props.sync().maxOpsPerMessage()) throw invalid("BATCH_SIZE");
    for (JsonNode op : ops) {
        JsonNode id = op.path("id");
        String siteId = id.path("siteId").asString(null);
        if (siteId == null || siteId.isBlank() || siteId.length() > MAX_ID_LENGTH) throw invalid("SITE_ID");
        if (!id.path("lamport").canConvertToLong() || id.path("lamport").asLong() < 0) throw invalid("LAMPORT");
        String kind = op.path("kind").asString(null);
        OperationKindValidator kv = kinds.get(kind);                 // Map<String,OperationKindValidator>
        if (kv == null) throw invalid("UNKNOWN_KIND");               // secure by default (P3.2)
        kv.validate(op);
    }
}
```
`InvalidOperationException` sempre se traduz para o frame `error{code:"INVALID_OP", detail:"<motivo curto>"}` (o campo `detail` é aditivo).

**Auto-configuração e propriedades:**

```java
@ConfigurationProperties("collab3d")
public record Collab3dProperties(
    @DefaultValue("design") String appType,
    @DefaultValue Session session, @DefaultValue Sync sync,
    @DefaultValue Snapshot snapshot, @DefaultValue Ws ws, @DefaultValue RateLimit rateLimit) {
  public record Session(@DefaultValue("4") int maxParticipants) {}
  public record Sync(@DefaultValue("200") int chunkSize, @DefaultValue("1000") int maxOpsPerMessage,
                     @DefaultValue("100") int maxVersionEntries) {}
  public record Snapshot(@DefaultValue("1000000") int maxBytes) {}
  public record Ws(List<String> allowedOrigins, @DefaultValue("500") int maxChatLength) {}
  public record RateLimit(@DefaultValue("50") int defaultPerSecond, Map<String,Integer> perType) {}
}

@AutoConfiguration
@EnableConfigurationProperties(Collab3dProperties.class)
public class Collab3dAutoConfiguration {
  @Bean @ConditionalOnMissingBean OperationAdmissionPolicy admitAll() { return new AdmitAllPolicy(); }
  @Bean @ConditionalOnMissingBean SnapshotPolicy snapshotPolicy(Collab3dProperties p) { return new HostOnlySnapshotPolicy(p.snapshot().maxBytes()); }
  @Bean @ConditionalOnMissingBean SessionCapacityPolicy capacity(Collab3dProperties p) { return new FixedCapacityPolicy(p.session().maxParticipants()); }
  @Bean @ConditionalOnMissingBean SessionBroadcaster broadcaster(SessionConnectionRegistry r) { return new InMemorySessionBroadcaster(r); }
  @Bean @ConditionalOnMissingBean RateLimitPolicy rateLimit(Collab3dProperties p) { return new TokenBucketRateLimitPolicy(p.rateLimit()); }
  // join policy: @Bean @ConditionalOnMissingBean(SessionJoinPolicy.class) → HostFriendJoinPolicy
  // listas (List<OperationKindValidator>, List<MessageValidator>, List<ServerOperationEmitter>) são injetadas via Spring; vazias são válidas.
}
```
Listas de beans (cadeias) **somam** com o default; para **substituir** o default de join (ex.: convite em vez de amizade), o app declara um bean com `@Primary`-equivalente: o default usa `@ConditionalOnMissingBean(SessionJoinPolicy.class)`, logo qualquer `SessionJoinPolicy` do app desliga o default. Documente isso no guia (§9).

### 6.2 Frontend

**⚠ Ajuste ao `OperationKindDefinition`**: kinds declaram as *fatias* de estado que possuem, para que `toSnapshot()/fromSnapshot()` (P3.3) funcionem sem o core conhecer o domínio.

```ts
export interface SliceDefinition<S = unknown> { key: string; strategy: MergeStrategy<S, any>; }

export interface OperationKindDefinition<TOp extends BaseOperation = BaseOperation, TChange = unknown> {
  kind: string;
  slices?: SliceDefinition[];                           // ex.: [{key:'objects', strategy: TombstoneSetStrategy}]
  validate(op: unknown): op is TOp;
  apply(doc: DocumentDraft, op: TOp, stamp: Stamp): TChange[];
  create?(input: unknown, ctx: { clock: LamportClock; siteId: string; author: string }): TOp;
}

export interface DocumentDraft {
  get<S>(key: string): S;                               // devolve strategy.empty() se ainda não existe
  set<S>(key: string, value: S): void;
}
```

**`DocumentState` genérico:**

```ts
export class DocumentState<TChange> {
  private slices = new Map<string, unknown>();
  constructor(private readonly registry: OperationKindRegistry<TChange>) {}

  apply(op: BaseOperation, stamp: Stamp = op.id): TChange[] {
    const def = this.registry.get(op.kind);
    if (!def) return [];                                 // kind desconhecido já foi barrado antes; ignorar com segurança
    return def.apply(this.draft(), op, stamp);
  }
  /** Reconstrói o estado do zero a partir de um prefixo do log (timeline/rollback). */
  static replay<T>(registry: OperationKindRegistry<T>, ops: BaseOperation[]): { doc: DocumentState<T>; changes: T[] } { /* ordena por seq, aplica */ }

  toSnapshot(): StateSnapshot {                          // inclui carimbos LWW e tombstones via strategy.toJSON
    const out: Record<string, unknown> = {};
    for (const [key, s] of this.slices) out[key] = this.registry.strategyOf(key).toJSON(s);
    return { schemaVersion: this.registry.schemaVersion, state: out };
  }
  static fromSnapshot<T>(registry: OperationKindRegistry<T>, snap: StateSnapshot): DocumentState<T> { /* strategyOf(key).fromJSON */ }

  private draft(): DocumentDraft {
    return {
      get: <S,>(k: string) => (this.slices.get(k) as S) ?? (this.slices.set(k, this.registry.strategyOf(k).empty()), this.slices.get(k) as S),
      set: (k, v) => void this.slices.set(k, v),
    };
  }
}
```
Duas kinds que declaram o mesmo `key` devem usar a **mesma** `strategy` (o registry falha no `register()` se não for o caso).

**`Projector<TChange>` e `SceneHost`:**

```ts
export interface SceneHost { readonly scene: THREE.Scene; readonly camera: THREE.Camera; readonly renderer: THREE.WebGLRenderer;
  onFrame(cb: (dtMs: number) => void): () => void; requestRender(): void; }

export abstract class Projector<TChange> {
  constructor(protected readonly host: SceneHost) {}
  abstract project(changes: readonly TChange[]): void;   // único escritor de conteúdo compartilhado
  abstract reset(): void;                                 // chamado antes de fromSnapshot/replay/rollback
  dispose(): void {}
}
```

**`rollback` no `ReplicaSession`** (necessário ao jogo em turnos; entra no P2.3):

```ts
rollback(rejected: OpId[]): void {
  this.log.remove(rejected);                              // remove ops locais e dependentes (deps)
  const { doc } = DocumentState.replay(this.registry, this.log.all());
  this.state = doc;
  this.projector.reset();
  this.projector.project(this.state.fullChanges());       // reprojeção completa; custo aceitável (raro)
}
```
O `SyncEngine` chama `rollback` ao receber `error{OP_REJECTED, refs}` e emite no `EventBus` `op:rejected` com o `reason` para a UI exibir.

**Validação de envelope no cliente** (mesma lógica do servidor):

```ts
export function validateEnvelope(op: unknown): op is BaseOperation {
  const o = op as BaseOperation;
  return !!o && typeof o === 'object'
    && typeof o.kind === 'string' && o.kind.length > 0 && o.kind.length <= 32
    && typeof o.id?.siteId === 'string' && o.id.siteId.length > 0 && o.id.siteId.length <= 100
    && Number.isInteger(o.id?.lamport) && o.id.lamport >= 0
    && Array.isArray(o.deps);
}
```

**Exemplo de um kind completo do editor** (`apps/design-editor/web/src/kinds/changeColor.ts`; ajuste os nomes de campo após a premissa P0.1):

```ts
export const changeColor: OperationKindDefinition<ChangeColorOp, SceneChange> = {
  kind: 'change_color',
  slices: [{ key: 'objectColor', strategy: LwwStrategy }],
  validate: (op): op is ChangeColorOp =>
    typeof (op as any).objectId === 'string' && /^#[0-9a-fA-F]{6}$/.test((op as any).color),
  apply(doc, op, stamp) {
    const r = LwwStrategy.apply(doc.get<LwwMap>('objectColor'), { key: op.objectId, value: op.color }, stamp);
    doc.set('objectColor', r.state);
    return r.changed ? [{ type: 'colorChanged', objectId: op.objectId, color: op.color }] : [];
  },
};
```
Validador Java equivalente (`apps/design-editor/backend`):

```java
@Component
class ChangeColorKindValidator implements OperationKindValidator {
    public String kind() { return "change_color"; }
    public void validate(JsonNode op) {
        String id = op.path("objectId").asString(null), color = op.path("color").asString(null);
        if (id == null || id.length() > 100 || color == null || !color.matches("#[0-9a-fA-F]{6}"))
            throw new InvalidOperationException("INVALID_OP", "change_color");
    }
}
```

---

## 7. Código de referência das aplicações 2 e 3

### 7.1 `turn-game` (jogo da velha 3×3; estende para 3D trocando a grade)

**Kinds (schema dos campos além do envelope):**

| kind | campos | quem pode emitir |
|---|---|---|
| `place_piece` | `cell: int [0..8]`, `piece: "X"\|"O"` | jogador da vez |
| `resign` | — | qualquer jogador (não espectador) |
| `game_over` | `winner: "X"\|"O"\|"DRAW"`, `winnerUserId?: long` | **só o servidor** (`appendSystem`) |
| `end_turn` | — | só na variante com várias ações por turno; no jogo da velha a vez passa implicitamente em `place_piece` |

**Estado do servidor:**

```java
public record TurnState(List<String> board, int moves, String winner) {   // board: 9 strings, "" = vazio
    public static TurnState empty() { return new TurnState(Collections.nCopies(9, ""), 0, null); }
    public String nextMark() { return moves % 2 == 0 ? "X" : "O"; }
    public boolean over() { return winner != null; }
}

@Component
class TurnStateReducer implements SessionStateReducer<TurnState> {
    private static final int[][] LINES = {{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}};
    public TurnState initial(SessionContext c) { return TurnState.empty(); }
    public Class<TurnState> stateType() { return TurnState.class; }
    public TurnState reduce(TurnState s, JsonNode op, long seq) {
        if (s.over()) return s;
        if (!"place_piece".equals(op.path("kind").asString(null))) return s;
        var b = new ArrayList<>(s.board());
        b.set(op.path("cell").asInt(), op.path("piece").asString());
        String w = null;
        for (int[] l : LINES) if (!b.get(l[0]).isEmpty() && b.get(l[0]).equals(b.get(l[1])) && b.get(l[1]).equals(b.get(l[2]))) w = b.get(l[0]);
        if (w == null && b.stream().noneMatch(String::isEmpty)) w = "DRAW";
        return new TurnState(List.copyOf(b), s.moves() + 1, w);
    }
}
```

**Admissão (mapeia marca → usuário: `X` = host, `O` = 2º participante na ordem de entrada):**

```java
@Component
class TurnAdmissionPolicy implements OperationAdmissionPolicy {
    public boolean supports(String appType) { return "turn-game".equals(appType); }
    public Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode op, SessionStateView view) {
        TurnState s = view.get(TurnState.class).orElseThrow();
        String kind = op.path("kind").asString(null);
        List<Long> p = ctx.participantIdsByJoinOrder();
        Long second = p.stream().filter(id -> id != ctx.hostId()).findFirst().orElse(null);
        boolean isPlayer = actor.userId() == ctx.hostId() || (second != null && actor.userId() == second);
        switch (kind) {
            case "game_over": return Optional.of(new RejectReason("FORBIDDEN_KIND", "game_over é emitido pelo servidor"));
            case "resign":    return isPlayer ? Optional.empty() : Optional.of(new RejectReason("SPECTATOR", "espectador"));
            case "place_piece": {
                if (s.over()) return Optional.of(new RejectReason("GAME_OVER", "partida encerrada"));
                long expected = s.nextMark().equals("X") ? ctx.hostId() : (second == null ? -1 : second);
                if (actor.userId() != expected) return Optional.of(new RejectReason("NOT_YOUR_TURN", "não é sua vez"));
                if (!op.path("piece").asString("").equals(s.nextMark())) return Optional.of(new RejectReason("WRONG_PIECE", "peça incorreta"));
                if (!s.board().get(op.path("cell").asInt()).isEmpty()) return Optional.of(new RejectReason("CELL_TAKEN", "célula ocupada"));
                return Optional.empty();
            }
            default: return Optional.empty();
        }
    }
}
```
**Emissão de `game_over`:**

```java
@Component
class GameOverEmitter implements ServerOperationEmitter {
    public List<ObjectNode> followUps(SessionContext ctx, List<AppendedOperation> appended, SessionStateView view) {
        TurnState s = view.get(TurnState.class).orElseThrow();
        boolean alreadyEmitted = /* flag mantida no estado: use um campo `gameOverEmitted` no TurnState ou checar o log */ false;
        if (!s.over() || alreadyEmitted) return List.of();
        ObjectNode go = mapper.createObjectNode();
        go.put("kind", "game_over"); go.put("winner", s.winner());
        return List.of(go);                                   // appender preenche id/author
    }
}
```
> ⚠ Para evitar `game_over` duplicado, o reducer deve **também** consumir a op `game_over` (marcando `emitted=true` no estado). Acrescente o campo `boolean gameOverEmitted` ao `TurnState`.

**Reidratação do reducer:** ao abrir uma sessão (ou reiniciar o servidor), o `SessionStateView` é reconstruído **replayando o log inteiro** dos kinds do app pelo reducer — o snapshot do cliente **não** substitui isso (log = fonte de verdade). Aceitável para partidas curtas; para domínios longos, adicione `SessionStateReducer.snapshot()/restore()` (fora de escopo).

**Frontend (esqueleto):**

```ts
export const placePiece: OperationKindDefinition<PlacePieceOp, BoardChange> = {
  kind: 'place_piece',
  slices: [{ key: 'board', strategy: LwwStrategy }],       // chave = cell; imutável após definido: ignorar op com stamp maior se já houver valor
  validate: (op): op is PlacePieceOp => Number.isInteger((op as any).cell) && (op as any).cell >= 0 && (op as any).cell <= 8 && ['X','O'].includes((op as any).piece),
  apply(doc, op, stamp) { /* escreve só se a célula estiver vazia */ },
};
export class PlaceMoveRule implements InteractionRule {
  id = 'place-move';
  canInteract(ctx, objectId, intent) { return ctx.get<TurnView>('turn').isMyTurn ? true : { code: 'NOT_YOUR_TURN' }; }
  toOperations(ctx, intent) { return [ctx.kinds.create('place_piece', { cell: intent.cell, piece: ctx.get<TurnView>('turn').myMark }) ]; }
}
```
Fluxo otimista: a op local é aplicada e projetada imediatamente; se chegar `error{OP_REJECTED}` com `refs`, o `SyncEngine` chama `ReplicaSession.rollback(refs)` e a UI mostra o motivo (`NOT_YOUR_TURN`…).

### 7.2 `avatar-chat`

**Canais:**

| Canal | Transporte | Persistido? | Taxa |
|---|---|---|---|
| `set_avatar {model,color,name}` | kind CRDT (LWW por usuário) | sim (entra no snapshot) | baixa |
| `chat_message {id,text}` | kind CRDT `AppendOnlyStrategy` | só se `avatar.persist-chat=true` (senão vai como frame efêmero `chat` do starter) | ≤ 2/s |
| `avatar_pose {pose:{x,y,z,ry}}` | frame `RELAY_EPHEMERAL` | **nunca** | ≤ 15–20 Hz |
| `emote {name}`, `typing {on}` | frame `RELAY_EPHEMERAL` | nunca | baixa |

**Handler de pose (backend):**

```java
@Component
class AvatarPoseHandler extends AbstractMessageTypeHandler {
    private final ObjectMapper mapper; private final AvatarProperties props;   // roomHalfSize (ex.: 20), maxY (ex.: 5)
    public String type() { return "avatar_pose"; }
    public Delivery delivery() { return Delivery.RELAY_EPHEMERAL; }

    protected void validate(WsMessageContext c, JsonNode p) {
        JsonNode pose = p.path("pose");
        for (String f : List.of("x","y","z","ry"))
            if (!pose.path(f).isNumber() || !Double.isFinite(pose.path(f).asDouble())) throw new MessageRejectedException("INVALID_MESSAGE");
        if (Math.abs(pose.path("x").asDouble()) > props.roomHalfSize() || Math.abs(pose.path("z").asDouble()) > props.roomHalfSize()
            || pose.path("y").asDouble() < 0 || pose.path("y").asDouble() > props.maxY()) throw new MessageRejectedException("INVALID_MESSAGE");
    }
    protected void execute(WsMessageContext c, JsonNode p) {
        ObjectNode out = mapper.createObjectNode();
        out.put("type", "avatar_pose");
        out.put("userId", c.actor().userId());               // carimbado pelo servidor, nunca do payload
        out.set("pose", p.get("pose"));
        c.broadcaster().broadcastExcept(c.connectionId(), out);
    }
}
```
Configuração: `collab3d.rate-limit.per-type.avatar_pose=20`, `...per-type.chat=2`, `...per-type.emote=2`.

**Política de sala privada:** `PrivateRoomJoinPolicy` exige (código de convite **e** ser amigo do host) **ou** estar na lista `allowedUserIds` da sessão; capacidade 8. Como o framework não tem campo de "lista de permitidos", guarde-a como kind CRDT `set_room_settings` emitido só pelo host (validado pela `OperationAdmissionPolicy`) **ou**, mais simples para o exemplo, use somente "código + amizade".

**Frontend:**

```ts
export interface PresenceChannelConfig<T> { type: string; throttleMs: number; ttlMs: number; validate(p: unknown): p is T; }
export interface PresenceChannel<T> {
  publish(value: T): void;                                  // throttle interno (último valor vence)
  subscribe(cb: (userId: string, value: T) => void): () => void;
  peers(): ReadonlyMap<string, { value: T; at: number }>;   // expira após ttlMs
}
// avatar-chat
const pose = app.presence<AvatarPose>({ type: 'avatar_pose', throttleMs: 70, ttlMs: 3000, validate: isPose });
```
`AvatarProjector`: um `Group` por `userId`; a cada frame (`host.onFrame`) interpola `position` e `rotation.y` rumo ao último `pose` recebido (`lerp` com fator `1 - exp(-dt/100ms)`), e se `now - at > ttlMs` remove o avatar (usuário caiu).

---

## 8. Protocolo WebSocket v2 (conteúdo de `docs/ws-protocol.md`)

URL (após P3.1): `ws(s)://<host>/ws/sessions/{sessionId}`. **Sem** `?userId=`. A identidade vem do cookie de sessão do handshake. Durante a janela de compatibilidade, `?userId=` presente e divergente do principal → `403`.

| Direção | `type` | Campos | Observação |
|---|---|---|---|
| C→S | `sync_hello` | `vv` | Cliente com `vv` vazio e snapshot disponível recebe `sync_snapshot` primeiro |
| C→S | `sync_ops` | `ops[]` | Lote ≤ `collab3d.sync.max-ops-per-message` |
| C→S | `scene_snapshot` | `snapshot: SnapshotEnvelope` | Política `SnapshotPolicy` |
| C→S | `presence`, `chat` | (substituíveis) | |
| C→S | *tipos do app* | definidos por `MessageTypeHandler` | ex.: `avatar_pose` |
| S→C | `sync_snapshot` | `snapshot`, `baseSeq` | **novo (aditivo)** |
| S→C | `sync_ops` | `ops[]` com `seq` | catch-up e relay |
| S→C | `sync_ack` | `siteId, lamport, seq` | |
| S→C | `session_roster` | `sessionId, status, participants[]` | |
| S→C | `error` | `code`, opcional `detail`, `refs[]` | `detail` e `refs` **novos (aditivos)** |

Códigos de erro: `UNKNOWN_TYPE`, `INVALID_MESSAGE`, `INTERNAL_ERROR`, `INVALID_OP`, `OP_REJECTED`, `SYNC_FAILED`, `INVALID_SNAPSHOT`, `SNAPSHOT_TOO_LARGE`, `SNAPSHOT_REJECTED` (existentes) + **`RATE_LIMITED`** (novo).

Exemplos:

```json
{"type":"error","code":"OP_REJECTED","refs":[{"siteId":"a1","lamport":42,"reason":"NOT_YOUR_TURN"}]}
{"type":"sync_snapshot","baseSeq":5012,"snapshot":{"schemaVersion":1,"appType":"design","baseSeq":5012,"versionVector":{"a1":310},"state":{},"checksum":"sha256:…"}}
{"type":"avatar_pose","userId":7,"pose":{"x":1.2,"y":0,"z":-3.4,"ry":1.57}}
```
Regra de compatibilidade: o cliente antigo ignora `sync_snapshot`, `detail` e `refs` (JSON extra) — por isso são aditivos. Qualquer remoção/renomeação de campo exige *major*.

---

## 9. Guia: "Como criar uma nova aplicação em 6 passos" (conteúdo de `docs/new-app-guide.md`)

Cada passo corresponde a um hot-spot. Checklist para o agente ao criar `apps/<nome>`:

1. **HS1 — Sincronização.** Liste os kinds e as fatias de estado. Para cada fatia, escolha `MergeStrategy` (`lww`, `tombstone-set`, `append-only` ou customizada). Se o servidor precisa ser autoritativo: `OperationAdmissionPolicy` + `SessionStateReducer` (+ `ServerOperationEmitter`). Defina `SyncPolicy` e `SnapshotPolicy`.
2. **HS2 — Mensagens.** Defina frames extras (`MessageTypeHandler` no back, `MessageDefinition` no front). Escolha `Delivery`: persistido, efêmero ou resposta unicast. Efêmero de alta frequência → configure `rate-limit.per-type`.
3. **HS3 — Validação.** Um `OperationKindValidator` por kind (Java) e `validate` por kind (TS), **gerados do mesmo JSON Schema** ou cobertos pela mesma suíte de casos (§10). Sem validador, o kind é rejeitado.
4. **HS4 — Interação.** Registre `Tool`s, `InteractionRule`s e `CommandFactory`s em `createCollabApp`. Lembre: regra no cliente é UX; autoridade é HS1.
5. **HS5 — Conexão.** Declare `SessionJoinPolicy`, `SessionCapacityPolicy` e `SessionVisibilityPolicy` como beans. Declarar **qualquer** `SessionJoinPolicy` desliga a regra default "só amigos do host".
6. **HS6 — Import/Export.** Registre `SceneImporter` (devolve `NewOperation[]`) e `SceneExporter` no `SceneFormatRegistry`; se o snapshot evoluir, implemente `SnapshotCodec.migrate`.

Pronto quando: `collab3d.app-type=<nome>` definido, `createCollabApp` chamado só com configuração (sem tocar o core), testes de contrato verdes e README do app com `./mvnw spring-boot:run` + `npm run dev`.

---

## 10. Estratégia de testes, contratos e gates

**Regras de fronteira (executáveis):**

```java
@AnalyzeClasses(packages = "dev.collab3d", importOptions = ImportOption.DoNotIncludeTests.class)
class FrameworkArchitectureTest {
  @ArchTest static final ArchRule starterIndependentOfApps =
      noClasses().that().resideInAPackage("dev.collab3d..").should().dependOnClassesThat().resideInAnyPackage("com.grupo03..", "dev.collab3d.apps..");
  @ArchTest static final ArchRule apiAndWsDoNotUseRepositories =
      noClasses().that().resideInAnyPackage("..api..", "..ws..").should().dependOnClassesThat().resideInAPackage("..repository..");
}
```
```bash
# scripts/check-no-domain-kinds.sh (CI)
! grep -RInE "add_object|remove_object|set_transform|change_color|mesh_edit" framework/ --include=*.java --include=*.ts \
   --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=test
```
TS: `madge --circular --extensions ts framework/core` e regra `eslint-plugin-boundaries` (`core` não importa `apps`, `react-kit` não importa `apps`).

**Testes de contrato front/back:** `contracts/<app>/<kind>.cases.json` com `{ "valid": [...], "invalid": [{"op":…, "why":…}] }`. Um teste JUnit e um Vitest leem o **mesmo** arquivo; divergência entre as duas implementações quebra o CI.

**Testes obrigatórios por área:**
- **CRDT (Vitest):** convergência com permutações aleatórias de ordem de aplicação (property-based com `fast-check`), idempotência, `fromSnapshot(toSnapshot(x))` ≡ `x`, `rollback` restaura estado.
- **Backend:** concorrência do sequenciador (P1.7), cadeia de admissão em lote (aceita/rejeita/`DEP_REJECTED`), `RATE_LIMITED`, spoofing (P3.1), snapshot corrompido (P3.3).
- **E2E (por app):** 2–4 clientes WebSocket de teste (backend) executando o cenário de aceite da Fase 4.

**Gates por fase** (além dos já descritos): Fase 0 → testes de caracterização verdes no commit base; Fase 1 → editor atual roda com front inalterado; Fase 2 → `grep` de kinds vazio no core e editor funcional; Fase 3 → suíte de spoofing + snapshot E2E verdes; Fase 4 → os 3 checklists de aceite.

**Ordem e paralelismo sugeridos:**
`P0.* → P1.1–P1.4 → (P1.5 ‖ P1.6 ‖ P1.7) → P1.8 → P1.9 → P1.10 → P1.11/P1.12`. A Fase 2 pode começar após P1.6 (contrato de kinds estável). P3.1 (back) pode rodar logo após P1.9; P3.1 (front) e P3.3 (cliente) aguardam P2.3. A Fase 4 só começa com os gates 1–3 verdes.

---

## 11. Riscos, decisões fechadas e pontos a verificar

**Decisões fechadas por este apêndice** (o agente não precisa perguntar):
1. Validação (HS3) atômica por lote; admissão (HS1) por operação com cascata via `deps`.
2. Frames efêmeros rodam fora do lock; persistidos, dentro.
3. `participantIdsByJoinOrder` substitui o `Set` em `SessionContext`.
4. Ops do servidor usam `siteId="server"`, `lamport=seq`, `author=null` (a coluna `author_id` já é nullable).
5. O estado do reducer é reconstruído do log; snapshot de cliente nunca alimenta o reducer.
6. `SelectionManager`/`EditorModeManager` ficam no app (resolve P2.6).

**Pontos a verificar no repositório real antes de codar** (não confirmados pelo manifesto; registrar em `docs/refactor-notes.md`, junto com as premissas de §0.4):
- **Flyway no Spring Boot 4:** o Boot 4 modularizou as auto-configurações; é provável que seja preciso o starter `spring-boot-starter-flyway` em vez de apenas `flyway-core`. Confirme que a migração roda no boot.
- **Jackson 3:** nomes de API mudaram (`tools.jackson.databind.*`; `JsonNode.asText()` → `asString()`). Os snippets deste plano usam a forma Jackson 3; ajuste se o compilador discordar.
- **Biblioteca de JSON Schema no back:** confirme se a versão do `networknt json-schema-validator` usada suporta Jackson 3. Se não suportar, mantenha `OperationKindValidator` escritos à mão e use o JSON Schema só nos testes de contrato.
- **Lamport do cliente ao receber ops do servidor:** confirme que `LamportClock` faz `observe(max)` ao aplicar ops remotas; senão, ops locais após uma op `server` podem receber lamport menor que o esperado (não quebra a convergência, mas confunde o desempate).
- **Cookie de sessão no upgrade WebSocket** através do proxy do Vite (`/ws` com `ws:true`): teste cedo; se o cookie não chegar, P3.1-4 precisa de um ticket de curta duração (`POST /sessions/{id}/ws-ticket` → token de uso único na URL).

**Riscos principais:** (a) o maior risco de regressão é P1.5/P1.6 (despachante e validador): proteja com o P0.2; (b) `DocumentState` genérico com `slices` mexe no coração do CRDT: execute P0.4 antes e mantenha a suíte de convergência; (c) `rollback` por replay completo é O(n): aceitável para jogos/edições pequenas, medir antes de otimizar; (d) snapshot sem checksum canônico (ordem de chaves) gera falsos negativos: serialize `state` com chaves ordenadas antes do SHA-256, nos dois lados.
