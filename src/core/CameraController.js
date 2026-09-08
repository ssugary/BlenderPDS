import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLOBAL_BUS } from './EventBus.js';

export class CameraController 
{
    constructor(camera, domElement) 
    {
        this.camera = camera;
        this.domElement = domElement;
        this.navMode = 'orbit';

        this.orbitControls = new OrbitControls(this.camera, this.domElement);
        this.walkControls = new PointerLockControls(this.camera, document.body);

        this.moveState = { forward: false, backward: false, left: false, right: false };
        this.speed = 8.0;

        this.bindEvents();
    }

    setMode(mode) {
        this.navMode = mode;
        if (mode === 'walk') 
        {
            this.orbitControls.enabled = false;
            this.walkControls.lock();
        } 
        else 
        {
            this.orbitControls.enabled = true;
            if (this.walkControls.isLocked) 
                this.walkControls.unlock();
            
        }
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

        this.walkControls.addEventListener('unlock', () => 
        {
            this.navMode = 'orbit';
            this.orbitControls.enabled = true;
        });
    }


    update(delta) 
    {
        if (this.navMode === 'orbit') 
            this.orbitControls.update();
        else if (this.navMode === 'walk' && this.walkControls.isLocked) 
        {
            if (this.moveState.forward) 
                this.walkControls.moveForward(this.speed * delta);
            if (this.moveState.backward) 
                this.walkControls.moveForward(-this.speed * delta);
            if (this.moveState.left) 
                this.walkControls.moveRight(-this.speed * delta);
            if (this.moveState.right) 
                this.walkControls.moveRight(this.speed * delta);
            if (this.moveState.up) 
                this.walkControls.getObject().position.y += this.speed * delta;
            if (this.moveState.down) 
                 this.walkControls.getObject().position.y -= this.speed * delta;
        }
    }
}