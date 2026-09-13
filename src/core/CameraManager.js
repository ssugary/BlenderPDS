import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLOBAL_BUS } from './EventBus.js';

export class CameraManager 
{
    constructor(camera, domElement) 
    {
        this.camera = camera;
        this.domElement = domElement;
        this.navMode = 'orbit';

        this.orbitControls = new OrbitControls(this.camera, this.domElement);

        this.moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
        this.speed = 8.0;

        this.isMouseDown = false;
        this.lookSpeed = 0.002;
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        this.bindEvents();
    }

    changeMode() 
    {
        if (this.navMode === 'walk') 
        {
            this.syncOrbitTarget();
            this.navMode = 'orbit';
        } 
        else 
        {
            this.navMode = 'walk';
            this.orbitControls.enabled = false;
            this.rotation.setFromQuaternion(this.camera.quaternion);
        }
        
    }

    syncOrbitTarget() 
    {
        this.orbitControls.enabled = true;
        this.camera.updateMatrixWorld(true);

        const worldPos  = new THREE.Vector3();
        const direction = new THREE.Vector3();

        this.camera.getWorldPosition(worldPos);
        this.camera.getWorldDirection(direction);
        
        const distance = 5; 

        this.orbitControls.target.copy(worldPos).addScaledVector(direction, distance);
        this.orbitControls.update();
    }

    bindEvents() 
    {
        GLOBAL_BUS.on('input:action', ({ action, state }) => 
        {
            if (this.navMode !== 'walk') 
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
        });

        this.domElement.addEventListener('mousedown', () => 
        {
            if (this.navMode === 'walk') 
                this.isMouseDown = true;
        });

        window.addEventListener('mouseup', () => 
        {
            this.isMouseDown = false;
        });

        window.addEventListener('mousemove', (event) => 
        {
            if (this.navMode !== 'walk' || !this.isMouseDown) 
                return;

            this.rotation.y -= event.movementX * this.lookSpeed;
            this.rotation.x -= event.movementY * this.lookSpeed;

            this.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.rotation.x));

            this.camera.quaternion.setFromEuler(this.rotation);
        });
    }

    update(delta) 
    {
        if (this.navMode === 'orbit') 
            this.orbitControls.update();
        else if (this.navMode === 'walk') 
        {
            const actualSpeed = this.speed * delta;
            
            const direction = new THREE.Vector3();

            this.camera.getWorldDirection(direction); 
            
            direction.y = 0;
            direction.normalize();

            const right = new THREE.Vector3(-direction.z, 0, direction.x)

            if (this.moveState.forward)  
                this.camera.position.addScaledVector(direction, actualSpeed);
            if (this.moveState.backward) 
                this.camera.position.addScaledVector(direction, -actualSpeed);
            if (this.moveState.left)     
                this.camera.position.addScaledVector(right, -actualSpeed);
            if (this.moveState.right)    
                this.camera.position.addScaledVector(right, actualSpeed);
            if (this.moveState.up)       
                this.camera.position.y += actualSpeed;
            if (this.moveState.down)     
                this.camera.position.y -= actualSpeed;
        }
    }
}