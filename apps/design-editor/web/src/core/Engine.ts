import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { SceneManager } from '../manager/SceneManager';
import { RenderEngine } from './RenderEngine';
import { CameraManager } from '../manager/CameraManager';
import { SelectionManager } from '../manager/SelectionManager';
import { RaycasterManager } from '../manager/RaycasterManager';
import { ToolManager } from '../manager/ToolManager';
import { TransformTool } from '../tool/implementation/TransformTool';
import { CreateObjectTool } from '../tool/implementation/CreateObjectTool';
import { DeleteTool } from '../tool/implementation/DeleteTool';
import { MeshEditTool } from '../tool/implementation/MeshEditTool';
import { VertexSelectionStrategy, FaceSelectionStrategy, EdgeSelectionStrategy, SelectionStrategy } from '../entity/SelectionStrategy';
import { EditMode, ObjectMode } from '../entity/EditorMode';
import { EditorModeManager } from '../manager/EditorModeManager';
import { CommandManager } from '../manager/CommandManager';
import { ReplicaSession } from '../collab/ReplicaSession';
import { SceneProjector } from '../collab/SceneProjector';
import { SyncEngine } from '../collab/SyncEngine';
import { PresenceService } from '../collab/PresenceService';
import { RemoteSelectionView } from '../collab/RemoteSelectionView';
import { Session } from '../network/Session';
import { GLOBAL_BUS } from './EventBus';
import { TransformGestureController } from './controllers/TransformGestureController';
import { SelectionController } from './controllers/SelectionController';
import { ActionRouter } from './controllers/ActionRouter';

interface SessionLink
{
    syncEngine:SyncEngine;
    presence:PresenceService;
    remoteSelection:RemoteSelectionView;
}

/**
 * Composition root of the editor: it builds the subsystems, hands them to the controllers and
 * runs the render loop. It does not decide what a click, a shortcut or a drag means anymore:
 * that lives in the controllers under `controllers/`.
 */
export class Engine
{
    private readonly clock:THREE.Clock;
    private animationFrameId:any;
    private readonly sceneManager:SceneManager;
    public readonly renderEngine:RenderEngine;
    private readonly cameraManager:CameraManager;
    private readonly selectionManager:SelectionManager;
    private readonly raycasterManager:RaycasterManager;
    private readonly commandManager:CommandManager;
    private readonly toolManager:ToolManager;
    private readonly transformControls:TransformControls;
    private readonly meshEditTool:MeshEditTool;
    private readonly editorModeManager:EditorModeManager;
    private readonly replica:ReplicaSession;
    private readonly network:Session | null;
    private readonly projector:SceneProjector;
    private readonly syncEngine:SyncEngine | null;
    private readonly presence:PresenceService | null;
    private readonly remoteSelection:RemoteSelectionView | null;
    private readonly selection:SelectionController;
    private readonly controllers:Array<{ dispose():void }>;

    constructor(domElement:HTMLElement, replica:ReplicaSession, network:Session | null = null)
    {
        this.replica = replica;
        this.network = network;
        this.clock = new THREE.Clock();
        this.animationFrameId = null;

        this.sceneManager = new SceneManager();
        this.renderEngine = new RenderEngine(this.sceneManager, domElement);

        this.cameraManager = new CameraManager(
            new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
            this.renderEngine.renderer.domElement
        );
        this.renderEngine.bindEvents(this.cameraManager.camera);
        this.cameraManager.camera.position.set(5, 5, 5);
        this.cameraManager.camera.lookAt(0, 0, 0);

        this.selectionManager = new SelectionManager(this.sceneManager);
        this.raycasterManager = new RaycasterManager(this.cameraManager.camera, this.sceneManager);
        this.commandManager = new CommandManager();
        this.toolManager = new ToolManager();

        this.transformControls = new TransformControls(this.cameraManager.camera, this.renderEngine.renderer.domElement);
        this.sceneManager.getNativeScene().add(this.transformControls);

        this.meshEditTool = new MeshEditTool(this.transformControls, this.commandManager, this.sceneManager, new FaceSelectionStrategy());
        this.editorModeManager = new EditorModeManager(
            new ObjectMode(this.selectionManager, this.toolManager),
            new EditMode(this.meshEditTool)
        );

        const createObjectTool = new CreateObjectTool(this.sceneManager);
        const deleteTool = new DeleteTool(this.sceneManager, this.selectionManager, this.transformControls);

        // The projection has to exist before the controllers and the network link: both read it.
        this.projector = this.setupProjection(createObjectTool);

        const link = this.connectSession();
        this.syncEngine = link?.syncEngine ?? null;
        this.presence = link?.presence ?? null;
        this.remoteSelection = link?.remoteSelection ?? null;

        this.registerTransformTools();

        const editStrategies:Record<string, SelectionStrategy> = {
            vertex: new VertexSelectionStrategy(),
            edge: new EdgeSelectionStrategy(),
            face: new FaceSelectionStrategy()
        };

        this.selection = new SelectionController({
            transformControls: this.transformControls,
            raycasterManager: this.raycasterManager,
            selectionManager: this.selectionManager,
            editorModeManager: this.editorModeManager,
            projector: this.projector,
            replica: this.replica,
            presence: this.presence
        });

        const gesture = new TransformGestureController({
            transformControls: this.transformControls,
            cameraManager: this.cameraManager,
            commandManager: this.commandManager,
            selectionManager: this.selectionManager,
            toolManager: this.toolManager,
            editorModeManager: this.editorModeManager,
            meshEditTool: this.meshEditTool,
            projector: this.projector,
            replica: this.replica
        });

        const actions = new ActionRouter({
            replica: this.replica,
            commandManager: this.commandManager,
            sceneManager: this.sceneManager,
            selectionManager: this.selectionManager,
            editorModeManager: this.editorModeManager,
            toolManager: this.toolManager,
            meshEditTool: this.meshEditTool,
            createObjectTool,
            deleteTool,
            projector: this.projector,
            cameraManager: this.cameraManager,
            selection: this.selection,
            editStrategies
        });

        gesture.install();
        actions.install();

        this.controllers = [gesture, actions];

        // Registered after the controllers so the callback can drop a selection they own.
        this.presence?.onLockLost(() =>
        {
            this.selection.dropSelection();
            GLOBAL_BUS.emit('ui:toast', 'The other player selected that object first.');
        });
    }

    /** The only bridge between DocumentState and three.js. Everything the peers share is drawn here. */
    private setupProjection(createObjectTool:CreateObjectTool):SceneProjector
    {
        const projector = new SceneProjector(this.replica, this.sceneManager, this.selectionManager, createObjectTool);

        projector.onMeshRemoved = (mesh) =>
        {
            if (this.transformControls.object === mesh)
                this.transformControls.detach();
        };

        return projector;
    }

    /** Sync, presence and remote selection only exist when the editor was opened inside a session. */
    private connectSession():SessionLink | null
    {
        if (!this.network)
            return null;

        const syncEngine = new SyncEngine(this.replica, this.network.transport);
        syncEngine.start();

        const presence = new PresenceService(this.replica.clock.id, this.network.transport);
        const remoteSelection = new RemoteSelectionView(this.sceneManager.getNativeScene(), presence, this.projector);

        return { syncEngine, presence, remoteSelection };
    }

    private registerTransformTools():void
    {
        const controls = this.transformControls;

        this.toolManager.registerTool('translate', new TransformTool(controls, 'translate'));
        this.toolManager.registerTool('rotate', new TransformTool(controls, 'rotate'));
        this.toolManager.registerTool('scale', new TransformTool(controls, 'scale'));
    }

    public start():void
    {
        const loop = () =>
        {
            const delta = this.clock.getDelta();

            this.cameraManager.update(delta);
            this.remoteSelection?.update();
            this.renderEngine.render(this.cameraManager.camera);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        loop();
    }

    public stop():void
    {
        if (this.animationFrameId)
            cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = null;
    }

    /**
     * Tears the engine down: stops the loop, detaches every listener the controllers installed and
     * releases the GPU context. React mounts the viewport inside an effect, which in dev runs twice,
     * so without this the second mount would leave a duplicate set of handlers behind.
     */
    public dispose():void
    {
        this.stop();

        for (const controller of this.controllers)
            controller.dispose();

        this.syncEngine?.stop();
        this.presence?.stop();

        this.transformControls.dispose();
        this.cameraManager.dispose();
        this.renderEngine.dispose();
    }
}
