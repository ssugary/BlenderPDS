import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { RenderEngine } from './RenderEngine.js';
import { CameraManager } from './CameraManager.js'; 
import { SelectionManager } from './SelectionManager.js';
import { RaycasterManager } from './RaycasterManager.js';
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
        this.cameraManager.camera.position.set(5, 5, 5);
        this.cameraManager.camera.lookAt(0, 0, 0);

        this.selectionManager = new SelectionManager(this.sceneManager);
        this.raycasterManager = new RaycasterManager(this.cameraManager.camera, this.sceneManager);
        this.bindEvents();
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
        const intersectedObject = this.raycasterManager.pick(coords);
        
        if (intersectedObject) 
            this.selectionManager.selectObject(intersectedObject);
        else 
            this.selectionManager.deselectAll();
        
    });
}
}