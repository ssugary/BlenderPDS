# Diagnóstico — classes vazias nos diagramas de classes

Inspeção dos 7 SVGs/PNGs de `classDiagram` (B1, B2a, B2b, B3, B4, B5a, B5b) contra os
respectivos `.mmd` e contra o código em HEAD. Total: **100 classes declaradas**, das quais
**38 renderizavam sem membros**.

## Causa por classe

Todas as 38 classes vazias foram declaradas no `.mmd` apenas como `class Nome` (ou com
`<<interface>>` e nenhum membro), sem corpo `{ ... }`. Portanto a causa é **(a): omissão no
fonte Mermaid**, não sintaxe inválida nem CSS.

| Diagrama | Classe vazia | Causa |
|---|---|---|
| B1 — domínio | — (nenhuma) | — |
| B2a — SPIs de sincronização | `AdmitAllPolicy` | (a) sem corpo no `.mmd` |
| B2a — SPIs de sincronização | `HostOnlySnapshotPolicy` | (a) sem corpo no `.mmd` |
| B2a — SPIs de sincronização | `InMemorySessionBroadcaster` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `AddObjectKindValidator` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `ChangeColorKindValidator` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `RemoveObjectKindValidator` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `SetTransformKindValidator` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `SetMeshKindValidator` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `HostFriendJoinPolicy` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `FixedCapacityPolicy` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `AlwaysVisiblePolicy` | (a) sem corpo no `.mmd` |
| B2b — validação e conexão | `TokenBucketRateLimitPolicy` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `SyncHelloHandler` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `SyncOpsHandler` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `SnapshotHandler` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `ChatRelayHandler` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `PresenceRelayHandler` | (a) sem corpo no `.mmd` |
| B3 — WebSocket | `RateLimitPolicy` | (a) só `<<interface>>`, sem métodos |
| B4 — CRDT e sync | `WebSocketTransport` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `SceneManager` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `RenderEngine` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `CameraManager` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `SyncEngine` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `DocumentState` | (a) sem corpo no `.mmd` |
| B5a — composição e render | `ReplicaSession` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `CreateObjectTool` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `DeleteTool` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `TransformTool` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `MeshEditTool` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `CreatePrimitiveCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `TransformCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `DeleteObjectCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `ColorEditCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `MeshEditCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `FaceExtrudeCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `ImportModelCommand` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `objFormat` | (a) sem corpo no `.mmd` |
| B5b — ferramentas e comandos | `ObjExporter` | (a) sem corpo no `.mmd` |

### Causas (b) e (c) descartadas

- **(b) sintaxe ignorada:** as 62 classes que já tinham corpo renderizaram **todos** os
  membros declarados no SVG (fields, métodos, `[]`, wildcards e tipos de retorno). O
  `verify-render.mjs` confere membro a membro e passou com 0 falhas nas 100 classes.
- **(c) tema/CSS escondendo texto:** os SVGs usam `fill:#333` sobre fundo branco; não há
  `themeVariables` nem `%%{init}%%` com cor de texto. As classes vazias não tinham sequer
  grupo `members-group`/`methods-group` com texto.

## Correção aplicada

- 38 classes preenchidas com membros reais do HEAD (campos e métodos principais, sem
  getters/setters/constructors), no máximo 6 por classe.
- Sintaxe Mermaid válida: uma declaração por linha, tipos simples, generics com `~T~`
  quando aplicável, sem `<>`, `?` ou vírgulas em tipos de retorno.
- Nomes/relações, cores frozen/hot-spot/app/infra e a legenda foram preservados.
- Nenhum código-fonte, teste, `pom.xml` ou `package.json` foi alterado.

## Verificação

```text
$ docs/diagrams/verify.sh
Nomes verificados: 100
Nomes inexistentes: 0

$ node docs/diagrams/verify-render.mjs
b1-dominio.mmd: 8 classes conferidas
b2-spis-conexao-validacao.mmd: 15 classes conferidas
b2-spis-sincronizacao.mmd: 10 classes conferidas
b3-websocket.mmd: 18 classes conferidas
b4-crdt-sync.mmd: 18 classes conferidas
b5-editor-app.mmd: 20 classes conferidas
b5-render-core.mmd: 11 classes conferidas
Falhas: 0
```

Testes negativos executados e restaurados:

```text
# removidos os 2 membros de FriendRequest no .mmd
VAZIA NO .MMD: b1-dominio.mmd :: FriendRequest
exit 1

# membro fictício no .mmd, ausente no SVG atual
MEMBRO AUSENTE NO SVG: b1-dominio.mmd :: User :: +String membroFantasma
exit 1
```

Os 7 `.mmd` de classe foram rerrenderizados (SVG + PNG, 2400 px de largura, fundo branco)
e os 7 PNGs foram abertos: nenhuma caixa de classe ficou vazia.

## Amostragem de membros contra o código

| Diagrama | 5 membros conferidos (arquivo:linha) |
|---|---|
| B1 | `User.java:52` id · `User.java:57` nickname · `Session.java:71` code · `Session.java:86` snapshotSeq · `SessionOperation.java:64` seq |
| B2a | `OperationAdmissionPolicy.java:16` admit · `SessionStateReducer.java:19` reduce · `SnapshotPolicy.java:17` maxBytes · `InMemorySessionBroadcaster.java:23` broadcast · `SnapshotCodec.java:11` currentSchemaVersion |
| B2b | `OperationKindValidator.java:18` validate · `AddObjectKindValidator.java:30` kind · `AddObjectKindValidator.java:22` maxMeshBytes · `HostFriendJoinPolicy.java:26` decide · `FixedCapacityPolicy.java:24` maxParticipants |
| B3 | `SessionSocketHandler.java:78` handleTextMessage · `AbstractMessageTypeHandler.java:13` handle · `SyncOpsHandler.java:49` execute · `WsFrames.java:50` syncOps · `FrameBatcher.java:25` split |
| B4 | `LamportClock.ts:18` tick · `OpLog.ts:40` since · `DocumentState.ts:76` apply · `Record.ts:46` write · `WebSocketTransport.ts:52` urlFor |
| B5a | `SceneManager.ts:32` addObject · `RenderEngine.ts:28` render · `CameraManager.ts:53` update · `SyncEngine.ts:55` start · `ReplicaSession.ts:26` commit |
| B5b | `Tool.ts:10` createCommand · `CommandManager.ts:17` execute · `MeshEditTool.ts:227` extrudeSelected · `ImportModelCommand.ts:25` execute · `SceneFormat.ts:38` forExtension |

## Omitido de propósito

- Getters, setters, construtores e campos privados de implementação sem valor explicativo.
- Membros herdados repetidos nas subclasses (ex.: `execute/undo/redo` de `Command`).
- `implements`/`extends` que o código não declara (ex.: `SceneProjector` e `Projector`).
- Classes com um único método público aparecem com um único membro; não foram infladas
  para chegar a 6.

## Não verificado

- Renderização em PowerPoint/Google Slides e mermaid.live.
- Leitura visual de cada membro nos PNGs; a presença foi conferida pelo script e a
  ausência de caixas vazias pela inspeção dos 7 PNGs.
- O B5b continua muito largo (20 classes em poucas linhas); não foi dividido nesta tarefa.
