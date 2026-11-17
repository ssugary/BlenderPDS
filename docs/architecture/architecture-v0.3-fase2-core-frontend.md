version: "0.3"
phase: "fase 2 — core frontend reutilizável, protocolo por registro e react-kit"
commit_sha: "1c7f680"
date: "2026-11-17"
previous_version: "architecture-v0.2-fase1-core-backend.md"
scope: "Snapshot completo do repositório ao fim da Fase 2 (P2.1–P2.11 + gate). O frontend deixou de ser uma aplicação única: framework/core (@collab3d/core) tem o CRDT genérico, transporte, sessão, presença, protocolo, cena/render e createCollabApp; framework/react-kit (@collab3d/react-kit) tem lobby, social, chat e toast; apps/design-editor/web tem só o domínio do editor (kinds, ferramentas, comandos, projeção). REST, WebSocket e o schema de operações continuam idênticos aos da v0.2; o banco não mudou nesta fase."

# 1. VISÃO GERAL

O produto continua sendo o **editor 3D colaborativo** em navegador, mas agora ele é uma aplicação
sobre um framework de três camadas:

- **`framework/core`** (`@collab3d/core`) — tudo que não é domínio: relógio de Lamport, log, CRDT
  genérico, transporte WebSocket, sessão, cliente REST, presença, protocolo de sincronização,
  cena/render/câmera/input e a raiz de composição `createCollabApp`.
- **`framework/react-kit`** (`@collab3d/react-kit`) — as telas e componentes React que qualquer
  aplicação colaborativa quer reaproveitar: lobby, social (amizades, autenticação), chat e toast.
- **`apps/design-editor/web`** (`blenderpds`) — o domínio do editor: os quatro kinds de operação, o
  projetor de cena, as ferramentas/comandos, os controladores e as telas específicas (viewport,
  toolbar, timeline, overlay).

O backend é o mesmo da v0.2 (`framework/backend-starter` + `apps/design-editor/backend`); esta fase
não tocou em REST, WebSocket, schema de operações nem no banco. O que mudou é que o **cliente** agora
tem a mesma separação de responsabilidades que o servidor ganhou na Fase 1.

```yaml
stack:
  frontend:
    workspaces: "raiz: {private: true, workspaces: [\"apps/*/web\", \"framework/*\"]}"
    evidence: "package.json:8-11"
    packages:
      - {name: "@collab3d/core", path: "framework/core", build: "vite build + tsc -p tsconfig.build.json (ESM + d.ts)", evidence: "framework/core/package.json:1-30"}
      - {name: "@collab3d/react-kit", path: "framework/react-kit", build: "vite build + tsc -p tsconfig.build.json", evidence: "framework/react-kit/package.json:1-40"}
      - {name: "blenderpds (app)", path: "apps/design-editor/web"}
    language: "TypeScript 7.0.2 (strict, noUnusedLocals/Parameters)"
    framework: "React 19.3.0"
    router: "react-router-dom 7.18.4 (react-kit)"
    3d: "three 0.161.x (peer do core)"
    bundler: "Vite 8.3.x + @vitejs/plugin-react"
    test_runner: "Vitest 5.1.x"
    alias: "app resolve @collab3d/core e @collab3d/react-kit para o src dos pacotes (tsconfig paths + Vite alias)"
    evidence: "apps/design-editor/web/tsconfig.json:14-17, apps/design-editor/web/vite.config.ts:9-13"
  backend:
    state: "inalterado desde a v0.2"
    modules:
      - "framework/backend-starter (dev.collab3d:collab3d-spring-boot-starter)"
      - "apps/design-editor/backend (com.grupo03:design-editor-backend)"
    java: "21"
    spring_boot: "4.1.1"
    json: "Jackson 3 (tools.jackson.*)"
    database: "PostgreSQL via compose.yaml + Flyway V1/V2"
```

O ganho de arquitetura da fase é a **inversão de controle**: o framework não conhece nenhum kind,
nenhum objeto e nenhuma tela do editor. O editor contribui com tabelas (`OperationKindRegistry`,
`MessageRegistry`, `SceneFormatRegistry`) e com uma função de montagem; o core só orquestra.

# 2. MAPA DE DIRETÓRIOS E ARQUITETURA

```text
framework/core/src/
  crdt/            Operation, OpId, LamportClock, OpLog, LWWRegister,
                   Record (DocumentRecord + estratégias), OperationKind, DocumentState
  events/          EventBus + GLOBAL_BUS
  transport/       Transport (interface) + WebSocketTransport
  session/         Session/SessionRole (handle do backend para o editor)
  api/             BackendClient (REST + CSRF, baseURL configurável)
  presence/        PresenceChannel<T> (genérico, com throttle/TTL/conflito)
  sync/            MessageRegistry, SyncReplica, SyncPolicy, SyncEngine
  scene/           SceneManager, RaycasterManager
  render/          RenderEngine, SceneHost, Projector
  camera/          CameraManager, Navigation (orbit/walk)
  input/           InputManager (keybindings -> bus)
  format/          SceneFormatRegistry
  app/             createCollabApp / CollabApp
  index.ts         superfície pública

framework/react-kit/src/
  hooks/           useBusEvent
  ui/              Lobby, LobbyTopBar, LobbyCube, LobbyShared, MenuPage, HostPage,
                   JoinPage, SocialPage, SocialContext, SocialUI, UseSocial,
                   AuthPanel, FriendsPanel, ChatPanel, Toast
  index.ts

apps/design-editor/web/src/
  collab/          ReplicaSession, Operation (união do editor), DocumentState (fachada),
                   objectState (acessores), SceneProjector, SceneSnapshot,
                   PresenceService (adaptador), RemoteSelectionView, validate
  kinds/           addObject, removeObject, setTransform, changeColor, validação, registry
  format/          ObjImporter, ObjExporter, objFormat, registry do app
  core/            createEditorApp + controllers (ActionRouter, SelectionController,
                   TransformGestureController)
  manager/         SelectionManager, ToolManager, CommandManager, EditorModeManager
  tool/, command/, entity/   ferramentas, comandos e estratégias do editor
  react/           Viewport3D, AppRoutes, EditorOverlay, TimelinePanel, Toolbar, ColorPicker
  integration/     twoReplicas.test.ts (gate da fase)
```

Regras de fronteira verificadas no gate:

| Regra | Como é verificada |
|---|---|
| `framework/` não importa `apps/` | `scripts/check-boundaries.mjs` (madge) |
| sem ciclos dentro de `framework/` | idem |
| core sem literais de kind do editor | `grep -R "add_object" framework/core` (vazio) |
| editor sobe por `createCollabApp` | `react/Viewport3D.tsx` chama `createEditorApp`, que é `createCollabApp` + `mount` |
| nenhum `switch` por tipo de mensagem | `SyncEngine` despacha por `MessageRegistry` |
| nenhum `switch` por kind no fold | `DocumentState.apply` delega ao registry |

# 3. MODELO DE DADOS E ESTADO

## 3.1 Documento genérico (cliente)

`DocumentRecord` é a única forma de estado que o core conhece:

```ts
interface DocumentRecord {
  id: string;
  createdBy: OpId;
  meta: ReadonlyMap<string, unknown>;        // imutável após a criação (ex.: geometry)
  fields: ReadonlyMap<string, LWWRegister<unknown>>; // por nome de campo (ex.: transform, color)
  addStamp: OpId;
  removeStamp: OpId | null;
  deleted: boolean;
}
```

- **LWW** (`LwwStrategy`) compara carimbos, não valores: um write que vence reporta mudança mesmo
  com valor idêntico — comportamento congelado desde a v0.0 e mantido.
- **Tombstone** (`TombstoneSetStrategy`) mantém o registro: um `add` mais novo que o `remove` revive.
- `DocumentState<TChange>` é um fold: `apply(op)` acha a definição pelo `kind`, chama `apply` e
  devolve só as mudanças reais.
- O editor lê os campos pelos acessores `geometryOf`, `transformOf`, `colorOf`
  (`collab/objectState.ts`), que é o que mantém o domínio fora do core.

## 3.2 Kinds do editor

| kind | campos | semântica preservada |
|---|---|---|
| `add_object` | `objectId`, `geometry`, `transform[16]`, `color` | cria com `geometry` em `meta`; revive se o add for mais novo; no revive grava `transform`, **não** `color` |
| `remove_object` | `objectId` | tombstone; reporta `removed` só na transição |
| `set_transform` | `objectId`, `matrix[16]` | LWW em `transform`; write em apagado não reporta |
| `change_color` | `objectId`, `color` | LWW em `color`; write em apagado não reporta |

`contracts/design-editor/<kind>.cases.json` é a fonte compartilhada dos casos válidos/inválidos,
lida pelo JUnit (`EditorKindContractsTest`) e pelo Vitest (`kinds/contracts.test.ts`).

## 3.3 Snapshot para o backend

`SceneSnapshot` continua sendo uma denormalização JSON (`revision`, `versionVector`, `objects`), sem
mudança de shape. O backend segue sem entender o CRDT; se snapshot e log divergirem, o log vence.

## 3.4 Presença

`PresenceChannel<T>` mantém `Map<siteId, {state, seenAt}>` local, publica o estado com throttle
opcional, expira por TTL quando configurado e resolve conflito pelo menor `siteId`. O editor usa
`T` = `{selectedObjectId: string | null}`; o lock é consultivo (o CRDT converge mesmo se dois
editarem).

# 4. ENTRY POINTS E FLUXOS

## 4.1 Subida do editor

```text
Main.tsx (ReplicaSession + Session)
  -> AppRoutes (lobby/react-kit)
  -> Viewport3D -> createEditorApp(container, replica, session)
       -> createCollabApp({container, replica, session, syncPolicy, mount})
            -> SceneHost (SceneManager + RenderEngine + CameraManager + loop)
            -> SyncEngine (se há session)  [sync_hello inicial]
            -> mount(context): ferramentas, controladores, SceneProjector,
               PresenceService, RemoteSelectionView
       -> app.start() / app.dispose()
```

`CollabApp.dispose()` para o loop, para o sync, chama o `dispose` do app (controladores, gizmo,
presença) e só então libera a câmera e o contexto WebGL. A ordem importa: um controlador pode ler
presença enquanto se desmonta.

## 4.2 Edição local

```text
ActionRouter / Tool / Command
  -> ReplicaSession.commit(newOp)
       -> LamportClock.tick -> OpLog.append -> DocumentState.apply -> Change[]
       -> onLocalOp -> SyncEngine {type:'sync_ops', ops:[op]}
  -> SceneProjector.apply(Change[])
```

## 4.3 Sincronização

```text
start(): transport.onMessage(onMessage); replica.onLocalOp(onLocalOp); send sync_hello{vv}
onMessage: registry.get(type) -> validate -> handle   (sem switch)
sync_hello: replica.log.since(vv) -> chunks de policy.chunkSize -> sync_ops
sync_ops:   policy.validateOperation -> replica.receive (duplicatas caem no OpLog)
```

Chat e demais mensagens de aplicação entram como `MessageDefinition` no construtor do `SyncEngine`;
o teste de integração registra `chat_message` e confirma a entrega sem tocar no motor.

## 4.4 Presença

```text
SelectionController -> PresenceService.claim(objectId)
  -> PresenceChannel.publish({selectedObjectId}) (throttle 0 no editor)
  -> wire: {type:'presence', siteId, state}
  -> peer: decode -> peers(); conflito (mesmo estado, siteId menor) -> onLockLost
close(): transport.onClose -> peers limpos
```

## 4.5 Importação e exportação

`ActionRouter` chama `ObjImporter.parseObject('model', sceneManager)` (File System Access API →
`objFormat.parse` → `SceneManager`) e `ObjExporter.exportSceneAsOBJ(sceneManager)`. A importação
continua **local**: converte-la em operações exigiria geometria > 100 caracteres e > 8 KB por frame
(ver §8 e `docs/refactor-notes.md` §13.2).

# 5. DEPENDÊNCIAS EXTERNAS E INTEGRAÇÕES

| Dependência | Onde | Papel |
|---|---|---|
| `three` 0.161 (peer) | core e app | cena, renderer, câmera, loaders/exporters OBJ |
| `react` / `react-dom` 19.3 | app e react-kit (peer) | UI |
| `react-router-dom` 7.18 | react-kit (peer) | rotas do lobby |
| `vite` 8.3 + `@vitejs/plugin-react` | builds | bundles e dev server |
| `vitest` 5.1 | core e app | testes de CRDT, contratos e integração |
| `typescript` 7.0.2 | todos | strict + declarações |
| `madge` 8 | raiz (dev) | gate de fronteira |
| Spring Boot 4.1.1 / Jackson 3 / Flyway | backend | inalterados |
| PostgreSQL (compose) | backend/testes | inalterado |

Sem novo serviço externo: a fase é de código e build, não de integração.

# 6. COMANDOS OPERACIONAIS

```bash
npm install                                   # workspaces: app + core + react-kit
npm run build -w @collab3d/core               # lib ESM + d.ts
npm run build -w @collab3d/react-kit          # lib ESM + d.ts
npm run build -w blenderpds                   # tsc + vite build do editor
npm test -w @collab3d/core                    # 16 testes (CRDT do framework)
npm test -w blenderpds                        # 43 testes (13 convergência + 26 contratos + 4 integração)
npm run check-boundaries                      # framework sem apps e sem ciclos (madge)
./mvnw test                                   # backend (starter + app + contratos JUnit)
grep -R "add_object" framework/core           # deve ser vazio
```

# 7. RESTRIÇÕES E FRONTEIRAS

1. **Core sem domínio.** Nenhum literal de kind, objeto, tela ou texto do editor. Os quatro kinds
   do editor vivem só em `apps/design-editor/web/src/kinds`.
2. **Contratos congelados nesta fase.** REST, WebSocket, envelope e schema de operações idênticos
   aos da v0.2. A única mudança de contrato do período foi a **capacidade anunciada no DTO** (P1.13),
   que já estava prevista e não altera o shape.
3. **Sem alteração de banco.** Nenhuma migração nova; V1/V2 continuam as mesmas.
4. **Alias de fonte.** O app compila o `src` dos pacotes; o build de cada pacote é verificado em
   separado. Não há cópia de código entre app e framework.
5. **Imutabilidade da documentação.** `architecture-v0.0`, `v0.1` e `v0.2` não foram editados.
6. **Testes de caracterização.** Os 13 casos de convergência continuam valendo com os mesmos
   asserts; mudar a semântica (revive/cor, LWW por carimbo) exige decisão explícita e novo snapshot.

# 8. STATUS E DÍVIDA TÉCNICA

```yaml
status:
  implemented_framework:
    - {feature: "CRDT genérico com registry de kinds e estratégias LWW/tombstone", evidence: "framework/core/src/crdt/DocumentState.ts, Record.ts, OperationKind.ts"}
    - {feature: "Transporte WebSocket, sessão e cliente REST com baseURL configurável", evidence: "framework/core/src/transport/*, session/Session.ts, api/BackendClient.ts"}
    - {feature: "Presença genérica com throttle, TTL e conflito por siteId", evidence: "framework/core/src/presence/PresenceChannel.ts"}
    - {feature: "Protocolo por MessageRegistry com SyncPolicy injetada", evidence: "framework/core/src/sync/*"}
    - {feature: "Cena/render/câmera/input e loop único no SceneHost", evidence: "framework/core/src/render/SceneHost.ts, scene/*, camera/*, input/*"}
    - {feature: "Raiz de composição createCollabApp com mount do app", evidence: "framework/core/src/app/CollabApp.ts"}
    - {feature: "Registro de formatos de cena", evidence: "framework/core/src/format/SceneFormat.ts"}
    - {feature: "react-kit com lobby, social, chat e toast", evidence: "framework/react-kit/src/ui/*"}
  implemented_apps:
    - {feature: "Kinds do editor como definições registradas", evidence: "apps/design-editor/web/src/kinds/*"}
    - {feature: "Contratos JSON compartilhados entre JUnit e Vitest", evidence: "contracts/design-editor/*.cases.json, .../EditorKindContractsTest.java, .../kinds/contracts.test.ts"}
    - {feature: "Projetor, snapshot, presença e validação do editor", evidence: "apps/design-editor/web/src/collab/*"}
    - {feature: "createEditorApp como única montagem do editor", evidence: "apps/design-editor/web/src/core/createEditorApp.ts"}
    - {feature: "Importador/exportador OBJ no app", evidence: "apps/design-editor/web/src/format/*"}
  tests:
    core: "16 — LamportClock 5, LWWRegister 6, OpLog 5"
    app: "43 — convergência 13, contratos 26, integração 4"
    backend: "159 — 150 do starter + 6 do app + 3 de contratos de kind (EditorKindContractsTest)"
  partial:
    - {feature: "Importação .obj colaborativa", gap: "continua local; geometria serializada não passa nos limites de contrato (§8)"}
    - {feature: "Presença com expiração", gap: "o canal suporta TTL, o editor não envia heartbeat e mantém TTL desligado"}
  stub_or_dead:
    - {feature: "OperationAppender.appendSystem", state: "UnsupportedOperationException (pré-requisito da Fase 4)"}
    - {feature: "collab3d.rate-limit", state: "propriedade sem uso (Fase 3)"}
```

```yaml
technical_debt:
  resolved_in_phase2:
    - {id: "session_dto_fixed_capacity", how: "SessionController.toDto usa SessionService.maxParticipants (mínimo entre políticas, fallback MAX_PARTICIPANTS); teste com política de capacidade 2 (P1.13)"}
    - {id: "crdt_revive_ignores_color", decision: "mantido como característica congelada; o kind do app documenta o porquê e o teste fixa o comportamento"}
    - {id: "crdt_change_reported_by_stamp", decision: "mantido; LWW compara carimbos, coberto pelo teste de convergência"}
    - {id: "frontend_single_package", how: "framework/core + framework/react-kit; app só com domínio (P2.1–P2.11)"}
    - {id: "switch_by_kind", how: "OperationKindRegistry + definições do app (P2.3/P2.4)"}
    - {id: "switch_by_message_type", how: "MessageRegistry (P2.8)"}
    - {id: "engine_manual_assembly", how: "createCollabApp + mount (P2.9)"}
    - {id: "hardcoded_kinds_frontend", how: "grep -R add_object framework/core vazio; kinds só no app"}
  open:
    - {id: "ws_frame_limit_8kb", desc: "frames acima de ~8 KB fecham a conexão (1009); chunk por bytes", phase: "PRIMEIRA tarefa da Fase 3"}
    - {id: "append_system_unimplemented", desc: "operações emitidas pelo servidor; game_over do turn-game depende disso", phase: "pré-requisito da Fase 4"}
    - {id: "obj_import_not_collaborative", desc: "geometry ≤100 chars, frame ≤8 KB e projetor sem geometria serializada", phase: "Fase 3"}
    - {id: "presence_no_heartbeat", desc: "TTL existe no canal e está desligado no editor", phase: "avaliar na Fase 3"}
    - {id: "timeline_replay_per_step", desc: "scrubber refaz o fold a cada passo", phase: "avaliar na Fase 3"}
    - {id: "rate_limit_unused", desc: "collab3d.rate-limit existe e não é aplicado", phase: "P3.4"}
    - {id: "actor_identity_from_request", desc: "userId/hostId de path/body/query", phase: "P3.1"}
    - {id: "no_ci", desc: "gates rodados manualmente", phase: "P3.4"}
    - {id: "in_memory_registry", desc: "sem broker, sem escala horizontal", phase: "P3.4"}
    - {id: "user_enumeration", desc: "GET /users lista todos", phase: "P3.4"}
    - {id: "hardcoded_dev_credentials", desc: "senha do Postgres literal em compose.yaml", phase: "P3.4"}
    - {id: "oauth2_starter_unused", desc: "starter OAuth2 sem client configurado", phase: "P3.2"}
    - {id: "doc_code_drift", desc: "README aponta para docs removidos", phase: "P3.4"}
    - {id: "visibility_n_plus_one", desc: "contexto por sala listada", phase: "avaliar"}
```

# 9. DELTA EM RELAÇÃO À VERSÃO ANTERIOR

Comparação com `architecture-v0.2-fase1-core-backend.md` (commit `13e6686`).

## 9.1 Adicionado

| Caminho | O quê |
|---|---|
| `framework/core/` | Pacote `@collab3d/core` (package.json, tsconfig, tsconfig.build, vite.config, vitest.config) |
| `framework/core/src/crdt/Record.ts` | `DocumentRecord`, `DocumentDraft`, `LwwStrategy`, `TombstoneSetStrategy` |
| `framework/core/src/crdt/OperationKind.ts` | `OperationKindDefinition` + `OperationKindRegistry` |
| `framework/core/src/crdt/DocumentState.ts` | Fold genérico por registro de kinds |
| `framework/core/src/presence/PresenceChannel.ts` | Presença genérica (throttle, TTL, conflito) |
| `framework/core/src/sync/MessageRegistry.ts` | `MessageDefinition`, `MessageRegistry`, `SyncReplica`, `SyncPolicy` |
| `framework/core/src/sync/SyncEngine.ts` | Motor de sincronização sem `switch` |
| `framework/core/src/render/SceneHost.ts`, `render/Projector.ts` | Host de cena/loop e contrato de projeção |
| `framework/core/src/format/SceneFormat.ts` | `SceneFormat`, `ImportedObject`, `SceneFormatRegistry` |
| `framework/core/src/app/CollabApp.ts` | `createCollabApp`/`CollabApp` |
| `framework/react-kit/` | Pacote com lobby, social, chat, toast e `useBusEvent` |
| `apps/design-editor/web/src/kinds/` | Quatro definições de kind, validação e `editorKinds()` |
| `apps/design-editor/web/src/format/` | `ObjImporter`, `ObjExporter`, `objFormat`, registry do app |
| `apps/design-editor/web/src/collab/objectState.ts` | Acessores `geometryOf`/`transformOf`/`colorOf` |
| `apps/design-editor/web/src/core/createEditorApp.ts` | Raiz de composição do editor sobre `createCollabApp` |
| `apps/design-editor/web/src/integration/twoReplicas.test.ts` | Gate de integração: 2 réplicas, reconexão, mensagem de app, presença |
| `contracts/design-editor/*.cases.json` | Casos válidos/inválidos compartilhados (4 kinds) |
| `apps/design-editor/backend/.../EditorKindContractsTest.java` | Lado servidor dos contratos |
| `scripts/check-boundaries.mjs` | Gate de fronteira com madge |
| `docs/architecture/architecture-v0.3-fase2-core-frontend.md` | Este snapshot |

## 9.2 Movido

| De | Para | Como |
|---|---|---|
| `apps/design-editor/web/src/collab/{OpId,LamportClock,OpLog,LWWRegister}.ts` | `framework/core/src/crdt/` | `git mv` + imports relativos |
| `apps/design-editor/web/src/core/EventBus.ts` | `framework/core/src/events/EventBus.ts` | `git mv` |
| `apps/design-editor/web/src/network/{Transport,WebSocketTransport}.ts` | `framework/core/src/transport/` | `git mv` |
| `apps/design-editor/web/src/network/Session.ts` | `framework/core/src/session/Session.ts` | `git mv` |
| `apps/design-editor/web/src/api/Backend.ts` | `framework/core/src/api/BackendClient.ts` | `git mv` + `configureBackend({baseUrl})` |
| `apps/design-editor/web/src/manager/SceneManager.ts` | `framework/core/src/scene/SceneManager.ts` | `git mv` |
| `apps/design-editor/web/src/manager/RaycasterManager.ts` | `framework/core/src/scene/RaycasterManager.ts` | `git mv` |
| `apps/design-editor/web/src/core/RenderEngine.ts` | `framework/core/src/render/RenderEngine.ts` | `git mv` |
| `apps/design-editor/web/src/manager/CameraManager.ts` | `framework/core/src/camera/CameraManager.ts` | `git mv` |
| `apps/design-editor/web/src/entity/Navigation.ts` | `framework/core/src/camera/Navigation.ts` | `git mv` |
| `apps/design-editor/web/src/manager/InputManager.ts` | `framework/core/src/input/InputManager.ts` | `git mv` |
| `apps/design-editor/web/src/core/ObjectParser.ts` | `apps/design-editor/web/src/format/ObjImporter.ts` | `git mv` + reescrita sobre `objFormat` |
| `apps/design-editor/web/src/core/utils/FileExporter.ts` | `apps/design-editor/web/src/format/ObjExporter.ts` | `git mv` |
| `apps/design-editor/web/src/react/ui/{Lobby,LobbyCube,LobbyTopBar,LobbyShared,MenuPage,HostPage,JoinPage,SocialPage,SocialContext,SocialUI,FriendsPanel,AuthPanel,UseSocial,ChatPanel,Toast}.tsx` | `framework/react-kit/src/ui/` | `git mv` |
| `apps/design-editor/web/src/react/useBusEvent.ts` | `framework/react-kit/src/hooks/useBusEvent.ts` | `git mv` |
| `apps/design-editor/web/src/core/Engine.ts` | `apps/design-editor/web/src/core/createEditorApp.ts` | `git mv` + reescrita (classe -> função de montagem) |

## 9.3 Removido

- O `switch (op.kind)` de `DocumentState` e o `switch (data.type)` de `SyncEngine`.
- A inferência de que todo estado é "objeto do editor" (`ObjectRecord` com `geometry/transform/color`
  fixos) — virou `DocumentRecord` genérico.
- A montagem manual de renderer/câmera/sync/presença dentro do `Engine`.
- A dependência do editor de conhecer o protocolo de presença (ficou em `PresenceChannel`).
- `apps/design-editor/web/src/manager/` deixou de conter código genérico: só
  `SelectionManager`, `ToolManager`, `CommandManager`, `EditorModeManager`.

## 9.4 Alterado (comportamento interno, contrato preservado)

| Caminho | Alteração |
|---|---|
| `DocumentState` (core) | fold por registry; `replay` passou a receber o registry |
| `ReplicaSession` | usa `createDocumentState()` (fachada do app) e mantém commit/receive/onChange/onLocalOp |
| `SyncEngine` (core) | despacho por `MessageRegistry`; `validateOperation` injetado pelo app |
| `PresenceService` | agora adaptador de `PresenceChannel`; mesma API pública do editor |
| `Engine` -> `createEditorApp` | `createCollabApp` é o dono do ciclo de vida; `mount` monta o domínio |
| `Viewport3D` | consome `CollabApp` (`host.renderEngine`, `start`, `dispose`) |
| `Main.tsx` | chat/toast vêm de `@collab3d/react-kit` |
| `AppRoutes`/`EditorOverlay` | lobby/social/friends vêm de `@collab3d/react-kit` |
| `validate.ts` | segue como regra do app; passou a ser o `validateOperation` do `SyncPolicy` |

## 9.5 Dívidas técnicas resolvidas (ids do manifesto v0.0/v0.1/v0.2)

- `session_dto_fixed_capacity` — **resolvida** em P1.13: o DTO anuncia a capacidade efetiva da
  política (mínimo entre as que suportam o app type), com teste de capacidade 2. Shape inalterado.
- `frontend_single_package` / `hardcoded_kinds_frontend` — **resolvidas**: core sem kind de domínio
  (`grep` vazio) e app só com os seus.
- `switch_by_kind` / `switch_by_message_type` — **resolvidas** pelos registries.
- `engine_manual_assembly` — **resolvida** por `createCollabApp`.

## 9.6 Dívidas técnicas novas

- `obj_import_not_collaborative` — importação `.obj` continua local; converter em operações exige
  geometria acima dos limites congelados (100 chars / ~8 KB) e suporte no projetor.
- `presence_no_heartbeat` — o canal suporta TTL, o editor não tem heartbeat e mantém TTL desligado.
- `timeline_replay_per_step` — o scrubber refaz o fold a cada passo.
- `p2_5_p2_9_single_commit` (processo) — as cinco tarefas entraram num commit porque compartilham a
  raiz de composição; registrado em `docs/refactor-notes.md` §13.1.

## 9.7 Contratos (REST / WS / schema de operações / banco)

| Contrato | Mudança | Tipo |
|---|---|---|
| REST | nenhuma rota/verbo/status/shape; `capacity` do DTO passou a refletir a política (P1.13) | **comportamental prevista** |
| WebSocket | nenhum tipo/campo removido/renomeado; mesmos `sync_hello`, `sync_ops`, `presence`, `chat_*`, `scene_snapshot` | **inalterado** |
| Schema de operações | envelope e payloads idênticos; contratos JSON só documentam o que já valia | **inalterado** |
| Banco de dados | nenhuma migração nesta fase (V1/V2) | **inalterado** |

O gate da Fase 2 foi verificado com: `grep -R "add_object" framework/core` vazio;
`npm run check-boundaries` verde; `npm run build -w @collab3d/core`,
`npm run build -w @collab3d/react-kit` e `npm run build -w blenderpds` verdes;
`npm test -w @collab3d/core` 16/16, `npm test -w blenderpds` 43/43; `./mvnw test` verde;
`EditorKindContractsTest` 3/3. O teste de integração (`twoReplicas.test.ts`) prova a convergência
do protocolo (criar/mover/colorir/excluir, reconexão, mensagem de aplicação e presença) sem
navegador; o gate **visual** (duas abas reais, WebGL) não foi executado.
