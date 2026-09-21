import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class RenderEngine
{
    private sceneManager:SceneManager;
    private container:HTMLElement;
    public renderer:THREE.WebGLRenderer;
    constructor(sceneManager:SceneManager, containerElement:HTMLElement)
    {

        this.sceneManager = sceneManager;
        this.container = containerElement || document.body;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);
    };

    public render(camera:THREE.PerspectiveCamera):void
    {
        this.renderer.render(this.sceneManager.getNativeScene(), camera);
    }

    public bindEvents(camera:THREE.PerspectiveCamera):void
    {
        window.addEventListener('resize', () => this.handleResize(camera));
    }

    public handleResize(camera:THREE.PerspectiveCamera):void
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

};

