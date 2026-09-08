import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CameraController } from './CameraController.js';

export class RenderEngine
{
    constructor(sceneManager, containerElement)
    {

        this.sceneManager = sceneManager;
        this.container = containerElement || document.body;
        this.animationFrameId = null;
        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        this.bindEvents();
    };

    bindEvents() 
    {
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() 
    {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    start() 
    {
        const loop = () => 
        {
            const delta = this.clock.getDelta();
            this.cameraController.update(delta);
            this.renderer.render(this.sceneManager.getNativeScene(), this.camera);
            this.animationFrameId = requestAnimationFrame(loop); 
        };

        loop();
    }

    stop() 
    {
        if (this.animationFrameId) 
            cancelAnimationFrame(this.animationFrameId);
        
    }

};

