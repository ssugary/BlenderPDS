import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLOBAL_BUS } from '../core/EventBus';

/** Base navigation strategy. CameraManager keeps one instance per mode and enables only the active one. */
export class Navigation 
{
    enable() {}
    disable() {}
    update(_delta:any) {}
    /** Releases whatever global listeners the strategy registered. */
    dispose() {}
}

/**
 * Orbit around a target (middle-drag rotates, right-drag pans). `syncTarget` re-centres it on
 * the way back from walk mode, so the camera does not jump.
 */
export class OrbitNavigation extends Navigation 
{
    private camera:THREE.PerspectiveCamera;
    private controls:OrbitControls;

    constructor(camera:THREE.PerspectiveCamera, domElement:HTMLCanvasElement) 
    {
        super();
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.controls.mouseButtons = {LEFT: null, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN};

        this.controls.enabled = false;
    }

    enable()  
    { 
        this.controls.enabled = true; 
    }
    disable() 
    { 
        this.controls.enabled = false; 
    }
    update(_delta:any) 
    { 
        if(this.controls.enabled) 
            this.controls.update(); 
    }

    syncTarget(distance = 5) 
    {
        this.camera.updateMatrixWorld(true);

        const worldPos = new THREE.Vector3();
        const direction = new THREE.Vector3();

        this.camera.getWorldPosition(worldPos);
        this.camera.getWorldDirection(direction);

        this.controls.target.copy(worldPos).addScaledVector(direction, distance);
        this.controls.update();
    }

    dispose() 
    { 
        this.disable();
        this.controls.dispose();
    }
}

/**
 * First-person camera: WASD/space moves and middle-drag looks. Movement arrives as `input:action`
 * events on the bus, and dispose() drops that subscription plus the window listeners.
 */
export class WalkNavigation extends Navigation 
{
    private camera:THREE.PerspectiveCamera;
    private domElement:HTMLElement
    private enabled:boolean;
    private isDragging:boolean;

    private rotation:THREE.Euler;
    private speed:number;
    private lookSpeed:number;
    private moveState:{ forward:boolean, backward:boolean, left:boolean, right:boolean, up:boolean, down:boolean };

    /* Stored so dispose() can unregister them: the viewport may be unmounted and rebuilt. */
    private onBusAction:(payload:{ action:string, state:string }) => void = () => {};
    private onWindowPointerUp:(e:PointerEvent) => void = () => {};
    private onWindowPointerMove:(e:PointerEvent) => void = () => {};

    constructor(camera:THREE.PerspectiveCamera, domElement:HTMLElement) 
    {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.enabled = false;
        this.isDragging = false;

        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.speed = 8.0;
        this.lookSpeed = 0.002;
        this.moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };

        this.bindEvents();
    }
    enable()  
    { 
        this.enabled = true; 
        this.rotation.setFromQuaternion(this.camera.quaternion); 
    }
    disable() 
    { 
        this.enabled = false; 
        this.isDragging = false; 
    }

    bindEvents() 
    {

        this.onBusAction = ({ action, state }) => 
        {
            if (!this.enabled) 
                return;
            
            const isPressed = state === 'down';

            switch (action) 
            {
                case 'move:forward':  
                    this.moveState.forward = isPressed;
                    break;
                case 'move:backward': 
                    this.moveState.backward = isPressed;
                    break;
                case 'move:left':     
                    this.moveState.left = isPressed;
                    break;
                case 'move:right':    
                    this.moveState.right = isPressed;
                    break;
                case 'move:up':       
                    this.moveState.up = isPressed;
                    break;
                case 'move:down':     
                    this.moveState.down = isPressed;
                    break;
            }
        };
        GLOBAL_BUS.on('input:action', this.onBusAction);

        this.domElement.addEventListener('pointerdown', (e:any) => 
        {
            if(!this.enabled || e.button !== 1) 
                return;
            this.isDragging = true;
            this.domElement.setPointerCapture(e.pointerId);
        });

        this.onWindowPointerUp = (e) => 
        {
            this.isDragging = false;
             if(this.domElement.hasPointerCapture(e.pointerId)) 
                this.domElement.releasePointerCapture(e.pointerId);
        };
        window.addEventListener('pointerup', this.onWindowPointerUp);

        this.onWindowPointerMove = (e) => 
        {
            if (!this.enabled || !this.isDragging) 
                return;

            this.rotation.y -= e.movementX * this.lookSpeed;
            this.rotation.x -= e.movementY * this.lookSpeed;

            this.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.rotation.x));

            this.camera.quaternion.setFromEuler(this.rotation);
        };
        window.addEventListener('pointermove', this.onWindowPointerMove);
    }

    dispose() 
    { 
        this.disable();
        GLOBAL_BUS.off('input:action', this.onBusAction);
        window.removeEventListener('pointerup', this.onWindowPointerUp);
        window.removeEventListener('pointermove', this.onWindowPointerMove);
    }

    update(delta:any) 
    {
        const actualSpeed = this.speed * delta;
        
        const direction = new THREE.Vector3();

        this.camera.getWorldDirection(direction); 
        
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3(-direction.z, 0, direction.x)

        if(this.moveState.forward)  
            this.camera.position.addScaledVector(direction, actualSpeed);
        if(this.moveState.backward) 
            this.camera.position.addScaledVector(direction, -actualSpeed);
        if(this.moveState.left)     
            this.camera.position.addScaledVector(right, -actualSpeed);
        if(this.moveState.right)    
            this.camera.position.addScaledVector(right, actualSpeed);
        if(this.moveState.up)       
            this.camera.position.y += actualSpeed;
        if(this.moveState.down)     
            this.camera.position.y -= actualSpeed;
        
    }
}