# BlenderPDS - Architecture (UML class diagrams)

Five views of the current code. Modules talk to each other in two ways: direct calls (solid/dashed arrows) and the global `EventBus` (`GLOBAL_BUS`), which decouples the UI, input and engine.

## 1. Engine and managers

`Engine` owns and wires everything. `SceneManager` is the single holder of scene objects, and the other managers read from it.

```mermaid
classDiagram
direction TB

class Engine {
    -clock
    -gestureStart
    +renderEngine RenderEngine
    +start()
    +stop()
    +setupTools()
    +bindEvents()
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
Engine ..> ObjectParser : imports models
Engine ..> FileExporter : exports OBJ
Engine ..> EventBus : subscribes
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

`Main.ts` runs the lobby first. When a session exists it creates the chat panel, then starts the engine. The UI talks to the engine only through `EventBus`.

```mermaid
classDiagram
direction LR

class Main {
    <<entry point>>
}
class Lobby {
    +run() Session
    -startHost()
    -startGuest()
}
class ChatPanel {
    -session Session
    -sendMessage()
    -setOnline(bool)
}
class UIManager
class Toolbar
class Viewport {
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
    <<interface>>
    +role SessionRole
    +transport Transport
}
class Transport {
    <<interface>>
    +send(data)
    +onMessage(callback)
    +onClose(callback)
    +close()
}
class WebRTCConnection {
    -peer RTCPeerConnection
    -channel RTCDataChannel
    +createOffer() string
    +acceptOffer(code) string
    +acceptAnswer(code)
    +waitUntilOpen()
}

Main --> Lobby : 1. runs
Main --> ChatPanel : 2. if connected
Main --> Engine : 3. starts
Main --> UIManager
Main --> InputManager

UIManager *-- Toolbar
UIManager *-- Viewport
Toolbar ..> EventBus : add, delete, tool/change
Viewport ..> EventBus : ui/canvas_clicked
InputManager ..> EventBus : input/action
Engine ..> EventBus : subscribes

Lobby --> WebRTCConnection : creates
Lobby ..> Session : resolves
ChatPanel --> Session
Session o-- Transport
Transport <|.. WebRTCConnection
Main ..> EventBus : network/connected
```
