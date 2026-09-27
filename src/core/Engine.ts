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

    constructor(domElement:HTMLElement) 
    {
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

            if (event.value) 
                this.gestureStart = tool.captureState(object);
            else 
            {
                const command = tool.createCommand(object, this.gestureStart, tool.captureState(object));
                if (command)
                    this.commandManager.execute(command);
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

        this.toolManager.registerTool('translate', new TransformTool(controls,cm,  'translate'));
        this.toolManager.registerTool('rotate',    new TransformTool(controls,cm,  'rotate'));
        this.toolManager.registerTool('scale',     new TransformTool(controls,cm,  'scale'));
    }

    start() 
    {
        const loop = () => 
        {
            const delta = this.clock.getDelta();
            
            this.cameraManager.update(delta);
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
            this.editorModeManager.active.onCanvasClick(intersect);
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
                this.commandManager.execute(new DeleteObjectCommand(this.createObjectTool, this.deleteTool, this.selectionManager.getSelected()))

            if (action === 'system:undo') 
            {
                this.commandManager.undo();
                this.selectionManager.update();
            }
            if (action === 'system:redo') 
            {
                this.commandManager.redo();
                this.selectionManager.update();
            }
        });

        GLOBAL_BUS.on('action:add_object', ({ type }) => 
        {
            this.commandManager.execute(new CreatePrimitiveCommand(this.createObjectTool, this.deleteTool, type));
            
        });

        GLOBAL_BUS.on('action:delete_object', ({}) => 
        {
            console.log('call')
            if (this.editorModeManager.current !== 'object')
                return;

            this.commandManager.execute(new DeleteObjectCommand(this.createObjectTool, this.deleteTool, this.selectionManager.getSelected()));
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