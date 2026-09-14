import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { SceneManager } from './SceneManager.js';
import { RenderEngine } from './RenderEngine.js';
import { CameraManager } from './camera/CameraManager.js'; 
import { SelectionManager } from './selection/SelectionManager.js';
import { RaycasterManager } from './RaycasterManager.js';
import { CommandManager } from '../transforms/CommandManager.js'; 
import { ToolManager } from '../transforms/ToolManager.js';
import { TransformTool } from '../transforms/tools/Tool.js'; 
import { FaceTool } from '../transforms/FaceTool.js';
import { VertexTool } from '../transforms/tools/VertexTool.js'; 
import { GLOBAL_BUS } from './EventBus.js';


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

        this.transformControls.addEventListener('dragging-changed', (event) => 
        {
            this.cameraManager.setGizmoDragging(event.value);

            const tool = this.toolManager.activeTool;
            const object = this.transformControls.object;

            if (!tool || !object) 
                return;

            if (event.value) 
                this.gestureStart = tool.captureState(object);
            else 
            {
                const command = tool.createCommand(object, this.gestureStart, tool.captureState(object));
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


        this.toolManager.registerTool('translate', new TransformTool(controls, cm, 'translate'));
        this.toolManager.registerTool('rotate',    new TransformTool(controls, cm, 'rotate'));
        this.toolManager.registerTool('scale',     new TransformTool(controls, cm, 'scale'));
        this.toolManager.registerTool('distortion',new VertexTool(controls, cm, this.sceneManager));
        this.toolManager.registerTool('face',      new FaceTool(controls, cm, this.sceneManager));
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
            const activeTool = this.toolManager.activeTool;

            if (activeTool instanceof VertexTool && intersect && intersect.object === activeTool.pointsMesh) 
            {
                activeTool.selectVertex(intersect);
                return; 
            }

            if (activeTool instanceof FaceTool && intersect && intersect.object === activeTool.activeMesh) 
            {
                activeTool.selectFace(intersect);
                return;
            }

            const intersectedObject = intersect ? intersect.object : null;
            
            if (intersectedObject) 
                this.selectionManager.selectObject(intersectedObject);
            else 
                this.selectionManager.deselectAll();
            
            if (this.toolManager.activeTool) 
                this.toolManager.activeTool.activate(this.selectionManager.getSelected());          
        });

        GLOBAL_BUS.on('tool:change', (toolName) => 
        {
            const selectedObject = this.selectionManager.getSelected(); 
            this.toolManager.setTool(toolName, selectedObject);
        });

        GLOBAL_BUS.on('input:action', ({ action, state }) => 
        {
            if (state !== 'down') 
                return; 

            if (action === 'action:extrude') 
                if (this.toolManager.activeTool instanceof FaceTool) 
                    this.toolManager.activeTool.extrudeSelectedFace();
                
            

            if (action.startsWith('tool:')) 
            {
                const toolName = action.split(':')[1]; 
                const selectedObject = this.selectionManager.getSelected(); 
                
                this.toolManager.setTool(toolName, selectedObject);
            }

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

        GLOBAL_BUS.on('camera:change_mode', () => 
        {
            this.cameraManager.changeMode();
        });

    }
}