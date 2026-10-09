# BlenderPDS - Proposed CRDT architecture

This is a proposal, not the current code. It replaces "commands mutate the scene directly" with "edits are operations in a replicated log, and the scene is a projection of that log". Compare with `architecture.md` for the current state.

The core idea:

- **Operation log** is the source of truth. Every edit is an immutable `Operation` with a unique id, appended to the log.
- **DocumentState** is a CRDT built by folding the log. Two replicas that hold the same set of operations hold the same state, regardless of arrival order.
- **Scene** (three.js) is only a view. `SceneProjector` turns state changes into `SceneManager` calls.
- **Transport** (WebRTC data channel, already built) only moves operations between replicas. No host is needed for correctness, so the lobby's host/guest roles only matter for connection setup.

## 1. Modules and responsibilities

New modules are marked `<<new>>`, modules that change are `<<changed>>`, and everything else stays as it is today.

```mermaid
classDiagram
direction TB

class Engine {
    <<changed>>
}
class CommandManager {
    <<changed>>
    +execute(command)
    +undo()
    +redo()
}
class Command {
    <<changed>>
    +toOperations() Operation[]
    +invert(state) Operation[]
}
class SceneManager {
    <<unchanged>>
    +addObject(object)
    +removeObject(uuid)
}
class SelectionManager {
    <<unchanged>>
}

class ReplicaSession {
    <<new>>
    +siteId string
    +clock LamportClock
    +commit(ops)
    +receive(ops)
}
class LamportClock {
    <<new>>
    +tick() OpId
    +observe(id)
}
class OpLog {
    <<new>>
    +append(op) bool
    +has(id) bool
    +since(versionVector) Operation[]
    +versionVector() VersionVector
}
class Operation {
    <<new>>
    +id OpId
    +author string
    +kind string
    +payload
    +deps OpId[]
}
class DocumentState {
    <<new>>
    +objects ObjectSet
    +apply(op)
    +get(objectId) ObjectRecord
    +snapshot() Snapshot
}
class ObjectSet {
    <<new>>
    add-wins set of object ids
}
class ObjectRecord {
    <<new>>
    +transform LWWRegister
    +material LWWRegister
    +geometry GeometryCRDT
    +deleted bool
}
class SceneProjector {
    <<new>>
    +onStateChanged(changes)
    -rebuild(objectId)
}
class SyncEngine {
    <<new>>
    +start()
    -sendHello()
    -onOps(ops)
    -requestMissing(vv)
}
class Transport {
    <<interface>>
    +send(data)
    +onMessage(callback)
}
class WebRTCConnection
class PresenceService {
    <<new>>
    +setCursor(objectId)
    +peers() PeerInfo[]
}
class TimelinePanel {
    <<new>>
    +scrubTo(opId)
    +filterByAuthor(author)
}
class ChatPanel {
    <<changed>>
}

Engine *-- ReplicaSession
Engine *-- SceneProjector
Engine *-- SyncEngine
Engine *-- PresenceService

CommandManager --> Command
Command ..> Operation : produces
CommandManager --> ReplicaSession : commit(ops)

ReplicaSession *-- LamportClock
ReplicaSession *-- OpLog
ReplicaSession *-- DocumentState
OpLog o-- Operation
DocumentState ..> Operation : folds
DocumentState *-- ObjectSet
DocumentState *-- ObjectRecord

DocumentState ..> SceneProjector : changes
SceneProjector --> SceneManager : add / remove / update
SceneProjector --> SelectionManager : drop stale selection

SyncEngine --> ReplicaSession : receive(ops)
SyncEngine --> OpLog : since(vv)
SyncEngine --> Transport
Transport <|.. WebRTCConnection
PresenceService --> Transport
ChatPanel --> Transport
TimelinePanel --> OpLog : reads
TimelinePanel --> DocumentState : replays into a scratch copy
```

## 2. Operations and state model

Operations carry results, not recipes. A move is "set transform to this matrix", not "translate by 1". That makes each operation idempotent and lets a last-writer-wins register resolve conflicts. The winner is the higher `(lamport, siteId)` pair, so every replica picks the same one.

```mermaid
classDiagram
direction LR

class OpId {
    +lamport int
    +siteId string
}
class Operation {
    <<abstract>>
    +id OpId
    +author string
    +deps OpId[]
}
class AddObject {
    +objectId string
    +geometry
    +transform Matrix4
}
class RemoveObject {
    +objectId string
}
class SetTransform {
    +objectId string
    +matrix Matrix4
}
class SetMaterial {
    +objectId string
    +color int
}
class MeshEdit {
    +objectId string
    +vertexId string
    +position Vector3
}
class TopologyEdit {
    +objectId string
    +kind string
    +result HalfEdgePatch
}
class Undo {
    +targets OpId[]
}

Operation <|-- AddObject
Operation <|-- RemoveObject
Operation <|-- SetTransform
Operation <|-- SetMaterial
Operation <|-- MeshEdit
Operation <|-- TopologyEdit
Operation <|-- Undo
Operation *-- OpId

class LWWRegister {
    +value
    +stamp OpId
    +set(value, stamp)
}
class ObjectRecord {
    +id string
    +createdBy OpId
    +deleted bool
}
class GeometryCRDT {
    +vertices Map
    +faces Set
}

ObjectRecord *-- LWWRegister : transform, material
ObjectRecord *-- GeometryCRDT
GeometryCRDT *-- LWWRegister : vertex positions
```

Conflict rules:

| Situation | Resolution |
|---|---|
| Both users move the same object | Last writer wins on `transform`. The other move is kept in the log, so it still shows in the timeline. |
| One deletes while the other moves | Delete wins, but the record is only tombstoned. An `Undo` of the delete brings it back. |
| Both add objects | No conflict. Ids are `(siteId, counter)`, so they never collide. |
| Both drag different vertices of one mesh | Both apply. Vertex positions are separate registers. |
| Both extrude or split on the same mesh | The hard case. Topology edits must be expressed as patches on stable vertex and face ids, not array indexes. See the risks below. |

## 3. Flow of one edit

Local edit first (the user drags a gizmo), then what the other replica does with it. The local replica never waits for the network.

```mermaid
sequenceDiagram
autonumber
participant U as User
participant T as TransformTool
participant CM as CommandManager
participant RS as ReplicaSession
participant DS as DocumentState
participant SP as SceneProjector
participant SY as SyncEngine
participant R as Remote replica

U->>T: drag gizmo and release
T->>CM: execute(TransformCommand)
CM->>CM: command.toOperations()
CM->>RS: commit(SetTransform)
RS->>RS: stamp OpId with Lamport clock
RS->>DS: apply(op) and append to OpLog
DS->>SP: changes (objectId transform)
SP->>SP: update mesh matrix
RS->>SY: broadcast(op)
SY-->>R: ops over data channel
R->>R: receive(op) dedupe by OpId
R->>R: apply to its own DocumentState
R->>R: SceneProjector updates its scene
Note over SY,R: On reconnect, both sides exchange version vectors and send only the missing operations
```

## 4. What changes in the existing code

| Today | After | Notes |
|---|---|---|
| `Command.execute()` mutates the scene | `Command.toOperations()` returns operations, and `SceneProjector` mutates the scene | Tools keep their logic. Only the last step changes. |
| `CommandManager` has undo and redo stacks of commands | Per-user stack of `OpId`s. Undo emits an inverse operation (or an `Undo` marker) | Undo must never rewind other people's edits. |
| `SceneManager` is the source of truth | `DocumentState` is the source of truth, and `SceneManager` is a view | Nothing outside `SceneProjector` should call `SceneManager.addObject` for shared content. |
| `Transport` carries chat only | `Transport` carries `hello`, `ops`, `presence` and `chat` messages | Add a `type` switch, which `ChatPanel` already does. |
| Host and guest roles | Symmetric peers after the handshake | Host only matters for the offer/answer exchange. |
| HEMesh vertex and face arrays with index-based ids | Stable ids on `HEVertex` and `HEFace` | Required for merging mesh edits. Do this first. |

## 5. Suggested build order

1. **Stable ids.** Give every object, vertex and face a stable id. No behaviour change.
2. **Operation layer.** Add `Operation`, `OpLog`, `DocumentState` and `SceneProjector` running locally. Convert `AddObject`, `RemoveObject` and `SetTransform` first and keep the app single-player.
3. **Replay and timeline.** Because the log exists, the `TimelinePanel` scrubber is almost free.
4. **Sync.** Add `SyncEngine` over the existing `Transport`: hello with version vector, send missing operations, then live broadcast.
5. **Mesh edits.** Move `MeshEdit` and then `TopologyEdit` onto operations.
6. **Per-user undo and presence.** Last, because they depend on everything above.

## Risks to decide early

- **Library or hand-rolled.** Automerge or Yjs give you the sync protocol and compaction, but topology edits still need a custom model. A hand-rolled log and LWW registers are small for this scope and easy to explain in a course report.
- **Topology merges.** Two concurrent extrudes on one face can produce an invalid half-edge mesh. The simplest safe rule is to lock a mesh to one author while it is in edit mode, and use operations for everything else.
- **Log growth.** Every drag can produce many operations. Emit one `SetTransform` on release, not on every frame. Add snapshots later to compact the log.
- **Security.** A peer can send arbitrary operations. Validate the shape and size of every incoming payload before applying it, as `ChatPanel` does for chat.
