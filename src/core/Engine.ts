import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { SceneManager } from '../manager/SceneManager.js';
import { RenderEngine } from './RenderEngine.js';
import { CameraManager } from '../manager/CameraManager.js'; 
import { SelectionManager } from '../manager/SelectionManager.js';
import { RaycasterManager } from '../manager/RaycasterManager.js';
import { ToolManager } from '../manager/ToolManager.js';
import { TransformTool } from '../tool/implementation/TransformTool.js'; 
import { CreateObjectTool } from '../tool/implementation/CreateObjectTool.js';
import { DeleteTool } from '../tool/implementation/DeleteTool.js';
import { GLOBAL_BUS } from './EventBus.js';
import { MeshEditTool } from '../tool/implementation/MeshEditTool.js';
import { VertexSelectionStrategy, FaceSelectionStrategy, EdgeSelectionStrategy } from '../entity/SelectionStrategy.js';
import { EditMode, ObjectMode } from '../entity/EditorMode.js';
import { EditorModeManager } from '../manager/EditorModeManager.js';
import { FileExporter } from './utils/FileExporter.js';
import { ObjectParser } from './ObjectParser.js';
import { CommandManager } from '../manager/CommandManager.js';
import { CreatePrimitiveCommand } from '../command/implementation/CreatePrimitiveCommand.js';
import { DeleteObjectCommand } from '../command/implementation/DeleteObjectCommand.js';
import { TransformCommand } from '../command/implementation/TransformCommand.js';
import { ReplicaSession } from '../collab/ReplicaSession.js';
import { SceneProjector } from '../collab/SceneProjector.js';
import { SyncEngine } from '../collab/SyncEngine.js';
import { PresenceService } from '../collab/PresenceService.js';
import { RemoteSelectionView } from '../collab/RemoteSelectionView.js';
import { Session } from '../network/Session.js';
export class Engine 
{

    private clock:THREE.Clock;
    private animationFrameId:any;
    private sceneManager:SceneManager;
    public renderEngine:RenderEngine;
    private cameraManager:CameraManager;
    private selectionManager:SelectionManager;
    private raycasterManager:RaycasterManager;
    private commandManager:CommandManager;
    private toolManager:ToolManager;
    private transformControls:TransformControls;
    private meshEditTool:MeshEditTool;
    private editStrategies:any;
    private editorModeManager:EditorModeManager;
    private gestureStart:any;

    private createObjectTool:any;
    private deleteTool:any;

    private replica:ReplicaSession;
    private network:Session | null;
    private projector!:SceneProjector;
    private presence:PresenceService | null;
    private remoteSelection:RemoteSelectionView | null;

    constructor(domElement:HTMLElement, replica:ReplicaSession, network:Session | null = null) 
    {
        this.replica = replica;
        this.network = network;
        this.presence = null;
        this.remoteSelection = null;

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
        this.editStrategies = {vertex: new VertexSelectionStrategy(), edge: new EdgeSelectionStrategy(), face: new FaceSelectionStrategy()};
        this.editorModeManager = new EditorModeManager(new ObjectMode(this.selectionManager, this.toolManager), new EditMode(this.meshEditTool));

        this.gestureStart
        this.transformControls.addEventListener('dragging-changed', (event:any) => 
        {
            this.cameraManager.setGizmoDragging(event.value);

            const tool = this.editorModeManager.current === 'edit' ? this.meshEditTool : this.toolManager.activeTool;
            const object = this.transformControls.object;

            if (!tool || !object) 
                return;

            const objectId = this.projector.objectIdFor(object);

            if (event.value) 
            {
                this.gestureStart = tool.captureState(object);
                this.projector.holdTransform(objectId);
            }
            else 
            {
                if(tool instanceof TransformTool && objectId)
                {
                    const command = new TransformCommand(this.replica, objectId, this.gestureStart, tool.captureState(object))
                    this.commandManager.execute(command);
                }
                this.projector.holdTransform(null);
            }
        });
        this.transformControls.addEventListener('objectChange', () => 
        {
            this.selectionManager.update();
        });

        this.setupTools();
        this.bindEvents();
    }

    setupTools() 
    {
        const controls = this.transformControls;
        const cm = this.commandManager;

        this.createObjectTool = new CreateObjectTool(this.sceneManager);
        this.deleteTool = new DeleteTool(this.sceneManager, cm, this.selectionManager, controls);

        this.setupCollab();

        this.toolManager.registerTool('translate', new TransformTool(controls,  'translate'));
        this.toolManager.registerTool('rotate',    new TransformTool(controls,  'rotate'));
        this.toolManager.registerTool('scale',     new TransformTool(controls,  'scale'));
    }

    /** Scene projection always runs. Sync, presence and remote selection boxes only exist when connected. */
    private setupCollab()
    {
        this.projector = new SceneProjector(this.replica, this.sceneManager, this.selectionManager, this.createObjectTool);
        this.projector.onMeshRemoved = (mesh) =>
        {
            if (this.transformControls.object === mesh)
                this.transformControls.detach();
        };

        if (!this.network)
            return;

        new SyncEngine(this.replica, this.network.transport).start();

        this.presence = new PresenceService(this.replica.clock.id, this.network.transport);
        this.presence.onLockLost(() =>
        {
            this.dropSelection();
            GLOBAL_BUS.emit('ui:toast', 'The other player selected that object first.');
        });
        this.remoteSelection = new RemoteSelectionView(this.sceneManager.getNativeScene(), this.presence, this.projector);
    }

    /** True when another player holds the clicked object (and tells the user why nothing happened). */
    private isLockedByOther(intersect:THREE.Intersection | null):boolean
    {
        const objectId = this.projector.objectIdFor(intersect ? intersect.object : null);
        if (!objectId || !this.presence || !this.presence.lockedBy(objectId))
            return false;

        GLOBAL_BUS.emit('ui:toast', 'That object is being edited by the other player.');
        return true;
    }

    /** Makes our published selection (the lock) match what is actually selected. */
    private syncPresence()
    {
        if (!this.presence)
            return;

        const objectId = this.projector.objectIdFor(this.selectionManager.getSelected());
        if (!objectId)
            this.presence.release();
        else if (!this.presence.claim(objectId))
            this.dropSelection();
    }

    private dropSelection()
    {
        this.transformControls.detach();
        this.selectionManager.deselectAll();
    }

    private deleteSelected()
    {
        const selected = this.selectionManager.getSelected();
        if (!selected)
            return;

        const objectId = this.projector.objectIdFor(selected);
        if (objectId)
            this.commandManager.execute(new DeleteObjectCommand(this.replica, objectId));
        else
            this.deleteTool.deleteObject(selected); // local-only object (imported model): not shared, no undo

        this.syncPresence();
    }

    start() 
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

    stop() 
    {
        if (this.animationFrameId) 
            cancelAnimationFrame(this.animationFrameId);
    }

    bindEvents() 
    {
        GLOBAL_BUS.on('action:add_object', ({ type }) => 
        {
            ObjectParser.parseObject(type, this.sceneManager);
        });
        GLOBAL_BUS.on('ui:canvas_clicked', (coords) => 
        {
            if (this.transformControls.axis !== null) 
                return;

            const intersect = this.raycasterManager.pick(coords);
            if (this.editorModeManager.current === 'object' && this.isLockedByOther(intersect))
                return;

            this.editorModeManager.active.onCanvasClick(intersect);
            this.syncPresence();
        });

        GLOBAL_BUS.on('tool:change', (toolName) => 
        {
            if (this.editorModeManager.current === 'edit' && this.editStrategies[toolName]) 
            {
                this.meshEditTool.setStrategy(this.editStrategies[toolName]);
                return;
            }
            const selection = this.selectionManager.getSelected()
            if(selection )
            this.toolManager.setTool(toolName, selection);
        });

        GLOBAL_BUS.on('editor:toggle_mode', () => 
        {
            const selection = this.selectionManager.getSelected()
            if(selection)
            this.editorModeManager.toggle(selection);
        });

        GLOBAL_BUS.on('input:action', ({ action, state }) => 
        {
            if (state !== 'down') 
                return; 

            if (action === 'action:extrude' && this.editorModeManager.current === 'edit') 
                this.meshEditTool.extrudeSelected();

            if (action === 'action:split_edge' && this.editorModeManager.current === 'edit') 
                this.meshEditTool.splitSelectedEdges();
                
            if (action.split(':')[0] == 'tool') 
                GLOBAL_BUS.emit('tool:change', action.split(':')[1]);

            if (action === 'editor:toggle') 
            {
                const selection = this.selectionManager.getSelected();
                if(selection)
                this.editorModeManager.toggle(selection);
            }

            if (action === 'action:delete_object' && this.editorModeManager.current === 'object')
                this.deleteSelected();

            if (action === 'system:undo') 
            {
                this.commandManager.undo();
                this.selectionManager.update();
                this.syncPresence();
            }
            if (action === 'system:redo') 
            {
                this.commandManager.redo();
                this.selectionManager.update();
                this.syncPresence();
            }
        });

        GLOBAL_BUS.on('action:add_object', ({ type }) => 
        {
            this.commandManager.execute(new CreatePrimitiveCommand(this.replica, this.createObjectTool, type));
            
        });

        GLOBAL_BUS.on('action:delete_object', ({}) => 
        {
            if (this.editorModeManager.current !== 'object')
                return;

            this.deleteSelected();
        });

        GLOBAL_BUS.on('camera:change_mode', () => 
        {
            this.cameraManager.changeMode();
        });
        GLOBAL_BUS.on('action:export_model', () => {
            FileExporter.exportSceneAsOBJ(this.sceneManager, 'scene.obj');
        });
    }
}