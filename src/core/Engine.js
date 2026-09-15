import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { SceneManager } from './SceneManager.js';
import { RenderEngine } from './RenderEngine.js';
import { CameraManager } from './camera/CameraManager.js'; 
import { SelectionManager } from './selection/SelectionManager.js';
import { RaycasterManager } from './RaycasterManager.js';
import { CommandManager } from '../transforms/CommandManager.js'; 
import { ToolManager } from '../transforms/ToolManager.js';
import { TransformTool } from '../transforms/tools/TransformTool.js'; 
import { CreateObjectTool } from '../transforms/tools/CreateObjectTool.js';
import { DeleteTool } from '../transforms/tools/DeleteTool.js';
import { GLOBAL_BUS } from './EventBus.js';
import { MeshEditTool } from '../transforms/tools/MeshEditTool.js';
import { VertexSelectionStrategy, FaceSelectionStrategy, EdgeSelectionStrategy } from './selection/SelectionStrategy.js';
import { EditMode, ObjectMode } from './selection/EditorMode.js';
import { EditorModeManager } from './selection/EditorModeManager.js';

export class Engine 
{
    constructor(domElement) 
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

        this.transformControls.addEventListener('dragging-changed', (event) => 
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

        this.createObjectTool = new CreateObjectTool(this.sceneManager, cm);
        this.deleteTool = new DeleteTool(this.sceneManager, cm, this.selectionManager, controls);
        this.createObjectTool.setDeleteTool(this.deleteTool);
        this.deleteTool.setCreateObjectTool(this.createObjectTool);

        this.toolManager.registerTool('translate', new TransformTool(controls, cm, 'translate'));
        this.toolManager.registerTool('rotate',    new TransformTool(controls, cm, 'rotate'));
        this.toolManager.registerTool('scale',     new TransformTool(controls, cm, 'scale'));
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
            this.toolManager.setTool(toolName, this.selectionManager.getSelected());
        });

        GLOBAL_BUS.on('editor:toggle_mode', () => 
        {
            this.editorModeManager.toggle(this.selectionManager.getSelected());
        });

        GLOBAL_BUS.on('input:action', ({ action, state }) => 
        {
            if (state !== 'down') 
                return; 

            if (action === 'action:extrude' && this.editorModeManager.current === 'edit') 
                this.meshEditTool.extrudeSelected();
                
            if (action.startsWith('tool:')) 
                GLOBAL_BUS.emit('tool:change', action.split(':')[1]);

            if (action === 'editor:toggle') 
                this.editorModeManager.toggle(this.selectionManager.getSelected());

            if (action === 'action:delete_object' && this.editorModeManager.current === 'object')
                this.deleteTool.createCommand(this.selectionManager.getSelected());

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
            const object = this.createObjectTool.createCommand(type);
            if (!object)
                return;

            this.selectionManager.selectObject(object);
            this.toolManager.activeTool?.activate(object);

            
        });

        GLOBAL_BUS.on('action:delete_object', () => 
        {
            if (this.editorModeManager.current !== 'object')
                return;

            this.deleteTool.createCommand(this.selectionManager.getSelected());
        });

        GLOBAL_BUS.on('camera:change_mode', () => 
        {
            this.cameraManager.changeMode();
        });

    }
}