# BlenderPDS - Architecture (UML class diagrams)

Five views of the current code. Modules talk to each other in two ways: direct calls (solid/dashed arrows) and the global `EventBus` (`GLOBAL_BUS`), which decouples the UI, input and engine.

## 1. Engine and managers

`Engine` is the composition root: it builds and wires the subsystems, runs the render loop and disposes everything. It does not decide what an input means anymore; the controllers under `core/controllers/` do (`TransformGestureController`, `SelectionController`, `ActionRouter`). `SceneManager` is the single holder of scene objects, and the other managers read from it.

```mermaid
classDiagram
direction TB

class Engine {
    -clock
    +renderEngine RenderEngine
    +start()
    +stop()
    +dispose()
}
class TransformGestureController {
    +install()
    +dispose()
}
class SelectionController {
    +clickAt(coords)
    +syncPresence()
    +dropSelection()
    +announce()
}
class ActionRouter {
    +install()
    +dispose()
}
class SceneManager {
    -scene Scene
    +objectsMap Map
    +addObject(object) string
    +removeObject(uuid, dispose) bool
    +getObject(uuid)
    +getNativeScene() Scene
}
class RenderEngine {
    +renderer WebGLRenderer
    +render(camera)
    +handleResize(camera)
}
class CameraManager {
    +camera PerspectiveCamera
    -navMode string
    +changeMode()
    +setGizmoDragging(bool)
    +update(delta)
}
class Navigation {
    <<abstract>>
    +enable()
    +disable()
    +update(delta)
}
class OrbitNavigation
class WalkNavigation
class SelectionManager {
    +selectedObject Mesh
    +selectionBox BoxHelper
    +selectObject(mesh)
    +deselectAll()
    +getSelected() Mesh
}
class RaycasterManager {
    +pick(coords) Intersection
}
class ToolManager
class CommandManager
class EditorModeManager
class EventBus {
    +on(event, callback)
    +off(event, callback)
    +emit(event, data)
}
class ObjectParser {
    <<static>>
    +parseObject(type, sceneManager)
}
class FileExporter {
    <<static>>
    +exportSceneAsOBJ(sceneManager, filename)
}
class FileLoader {
    <<static>>
    +getfile() string
}

Engine *-- SceneManager
Engine *-- RenderEngine
Engine *-- CameraManager
Engine *-- SelectionManager
Engine *-- RaycasterManager
Engine *-- ToolManager
Engine *-- CommandManager
Engine *-- EditorModeManager
Engine *-- TransformGestureController
Engine *-- SelectionController
Engine *-- ActionRouter
TransformGestureController ..> CommandManager : execute
ActionRouter ..> CommandManager : execute
ActionRouter ..> ObjectParser : imports models
ActionRouter ..> FileExporter : exports OBJ
ActionRouter ..> EventBus : subscribes
ObjectParser ..> FileLoader
ObjectParser ..> SceneManager
FileExporter ..> SceneManager

RenderEngine --> SceneManager
SelectionManager --> SceneManager
RaycasterManager --> SceneManager

CameraManager o-- Navigation
Navigation <|-- OrbitNavigation
Navigation <|-- WalkNavigation
WalkNavigation ..> EventBus : input/action
EditorModeManager ..> EventBus : editor/mode_changed
```

## 2. Tools and commands

A tool does the work, and a command makes it undoable. `ToolManager` holds the tools, and `CommandManager` holds the undo/redo stacks. Create and delete commands call the create/delete tools so that undo can reverse them. `CreateObjectTool` and `DeleteTool` also write to `SceneManager`, and `DeleteTool` uses `SelectionManager`.

```mermaid
classDiagram
direction LR

class ToolManager {
    +activeTool Tool
    +registerTool(name, tool)
    +setTool(name, selection)
}
class Tool {
    <<abstract>>
    +activate(object)
    +deactivate()
    +captureState(object)
}
class TransformTool {
    -mode string
    +activate(object)
    +captureState(object) Matrix4
}
class CreateObjectTool {
    +buildPrimitive(type) Mesh
    +createObject(object)
}
class DeleteTool {
    +deleteObject(object)
}
class MeshEditTool

class CommandManager {
    -undoStack Command[]
    -redoStack Command[]
    +execute(command)
    +undo()
    +redo()
}
class Command {
    <<abstract>>
    +execute()
    +undo()
    +redo()
}
class AddObjectCommand
class CreatePrimitiveCommand {
    +getCreatedObject()
}
class DeleteObjectCommand
class TransformCommand {
    -oldMatrix Matrix4
    -newMatrix Matrix4
}
class MeshEditCommand
class FaceExtrudeCommand

ToolManager o-- Tool : registered tools
Tool <|-- TransformTool
Tool <|-- CreateObjectTool
Tool <|-- DeleteTool
Tool <|-- MeshEditTool

CommandManager o-- Command : undo / redo stacks
Command <|-- AddObjectCommand
Command <|-- CreatePrimitiveCommand
Command <|-- DeleteObjectCommand
Command <|-- TransformCommand
Command <|-- MeshEditCommand
Command <|-- FaceExtrudeCommand

AddObjectCommand ..> CreateObjectTool
AddObjectCommand ..> DeleteTool
CreatePrimitiveCommand ..> CreateObjectTool
CreatePrimitiveCommand ..> DeleteTool
DeleteObjectCommand ..> CreateObjectTool
DeleteObjectCommand ..> DeleteTool
MeshEditCommand ..> MeshEditTool
DeleteTool --> CommandManager
MeshEditTool --> CommandManager
```

## 3. Editor modes

`EditorModeManager` switches between object mode (select whole objects and use the transform gizmo) and edit mode (edit vertices, edges and faces). The active mode receives every canvas click that `Engine` picks.

```mermaid
classDiagram
direction TB

class EditorModeManager {
    +current string
    +active EditorMode
    +setMode(mode, payload)
    +toggle(selected)
}
class EditorMode {
    <<abstract>>
    +enter(payload)
    +exit()
    +onCanvasClick(intersect)
}
class ObjectMode
class EditMode
class SelectionManager
class ToolManager
class MeshEditTool
class Engine

Engine *-- EditorModeManager
Engine ..> EditorModeManager : onCanvasClick(intersect)
EditorModeManager o-- EditorMode
EditorMode <|-- ObjectMode
EditorMode <|-- EditMode
ObjectMode --> SelectionManager : selects object
ObjectMode --> ToolManager : re-activates tool
EditMode --> MeshEditTool : enter / exit / selectAt
```

## 4. Mesh editing domain

Edit mode works on a half-edge mesh stored in `mesh.userData.heMesh`. A selection strategy decides what a click picks (vertex, edge or face) and what the helper objects look like.

```mermaid
classDiagram
direction LR

class MeshEditTool {
    +strategy SelectionStrategy
    -activeMesh Mesh
    -activeHEMesh HEMesh
    -selectedElements
    -selectedVertices HEVertex[]
    -pickHelper Object3D
    -highlightObject Object3D
    +setTargetMesh(mesh)
    +setStrategy(strategy)
    +selectAt(intersect)
    +extrudeSelected()
    +splitSelectedEdges()
    +captureState() Vector3[]
    +rebuildGeometry()
    +applyGeometrySnapshot(data)
    +recenterGizmo()
    +updateHighlight()
}

class SelectionStrategy {
    <<abstract>>
    +usesMeshAsPickTarget() bool
    +createPickHelper()
    +updatePickHelper(helper, heMesh)
    +pick(heMesh, intersect)
    +createHighlightObject()
    +updateHighlightObject(...)
    +supportsExtrude() bool
    +supportsEdgeSplit() bool
}
class VertexSelectionStrategy
class EdgeSelectionStrategy
class FaceSelectionStrategy

class HEMesh {
    +vertices HEVertex[]
    +faces HEFace[]
    +edges HEEdge[]
    +fromBufferGeometry(geometry)
    +toBufferGeometry()
    +faceVertices(face)
    +computeNormal(face)
    +getCoplanarGroup(face)
    +extrudeFaceGroup(faces)
    +splitEdge(edge)
    +recalculateTwins()
}
class HEVertex {
    +getXYZ() Vector3
    +setXYZ(x, y, z)
    +getHalfEdge() HEEdge
}
class HEFace {
    +getHalfEdge() HEEdge
}
class HEEdge {
    +getVertex() HEVertex
    +getTwin() HEEdge
    +getNext() HEEdge
    +getPrev() HEEdge
    +getFace() HEFace
}

class MeshEditCommand {
    -oldPositions Vector3[]
    -newPositions Vector3[]
    +apply(positions)
}
class FaceExtrudeCommand {
    -beforeGeo
    -afterGeo
}

MeshEditTool o-- SelectionStrategy : current strategy
MeshEditTool --> HEMesh : edits
SelectionStrategy <|-- VertexSelectionStrategy
SelectionStrategy <|-- EdgeSelectionStrategy
SelectionStrategy <|-- FaceSelectionStrategy
SelectionStrategy ..> HEMesh : picks from

HEMesh "1" *-- "*" HEVertex
HEMesh "1" *-- "*" HEFace
HEMesh "1" *-- "*" HEEdge
HEEdge --> HEVertex : origin
HEEdge --> HEFace : face
HEEdge --> HEEdge : twin, next, prev
HEVertex --> HEEdge
HEFace --> HEEdge

MeshEditCommand --> MeshEditTool
MeshEditCommand --> HEVertex
MeshEditTool ..> MeshEditCommand : creates
MeshEditTool ..> FaceExtrudeCommand : creates
```

## 5. UI, input and networking

This view is React-first: there is no `UIManager` and no `Viewport` class. `Main.tsx` mounts
`AppRoutes`, which shows the lobby (`/`, `/login`, `/friends`, `/host`, `/join`) until a page
calls `onStart` with a `Session`; `/editor` then renders `Viewport3D`, the panels and the
overlay. `Viewport3D` is the only place that builds `Engine`, inside an effect, and disposes
it on unmount. The React UI and the engine talk to each other through `EventBus`.

Collaboration has exactly one transport: `WebSocketTransport`, created by `HostPage` (role
`host`) or `JoinPage`/`FriendsPage` (role `guest`). Its URL points at the backend socket
(`/ws/sessions/{id}?userId=`), so the server sequences and stores operations and relays
presence/chat. `Transport` stays as the interface because `SyncEngine`, `PresenceService`
and `ChatPanel` depend on it rather than on the socket.

```mermaid
classDiagram
direction LR

class Main {
    <<entry point>>
}
class AppRoutes {
    +renderEditor({ leave })
}
class Lobby {
    +onStart(session)
}
class HostPage {
    -startHosting()
}
class JoinPage {
    -join()
}
class FriendsPage {
    -join(friend)
}
class ChatPanel {
    -session Session
    -sendMessage()
    -setOnline(bool)
}
class Toolbar
class Viewport3D {
    -pointerDownCoords
}
class InputManager {
    -keybindings
    +init()
    +destroy()
}
class EventBus {
    +on(event, callback)
    +emit(event, data)
}
class Engine

class Session {
    +role SessionRole
    +transport Transport
    +sessionId number
    +userId number
}
class Transport {
    <<interface>>
    +send(data)
    +onMessage(callback)
    +onClose(callback)
    +close()
}
class WebSocketTransport {
    +urlFor(sessionId, userId) string
    +send(data)
    -open()
    -notifyClose()
}

Main --> AppRoutes : mounts
Main --> InputManager : keybindings
AppRoutes --> Lobby : no session yet
AppRoutes --> Viewport3D : /editor

HostPage ..> WebSocketTransport : creates
JoinPage ..> WebSocketTransport : creates
FriendsPage ..> WebSocketTransport : creates
HostPage ..> Session : host
JoinPage ..> Session : guest
FriendsPage ..> Session : guest

Viewport3D --> Engine : creates / disposes
Engine --> Session
ChatPanel --> Session
Session o-- Transport
Transport <|.. WebSocketTransport

Toolbar ..> EventBus : action:add_object, tool:change
Viewport3D ..> EventBus : ui:canvas_clicked
InputManager ..> EventBus : input:action
Engine ..> EventBus : subscribes
```
