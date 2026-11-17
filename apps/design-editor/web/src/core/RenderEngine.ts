import * as THREE from 'three';
import { SceneManager } from '../manager/SceneManager';

/**
 * Owns the WebGLRenderer: appends the canvas to the viewport, renders one frame from the camera
 * and keeps it sized to the window. dispose() drops the listener and the GL context.
 */
export class RenderEngine
{
    private sceneManager:SceneManager;
    private container:HTMLElement;
    private resizeHandler:(() => void) | null;
    public renderer:THREE.WebGLRenderer;
    constructor(sceneManager:SceneManager, containerElement:HTMLElement)
    {

        this.sceneManager = sceneManager;
        this.container = containerElement || document.body;
        this.resizeHandler = null;
        
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
        this.resizeHandler = () => this.handleResize(camera);
        window.addEventListener('resize', this.resizeHandler);
    }

    /** Drops the resize listener and the WebGL context, so the viewport can be mounted again from scratch. */
    public dispose():void
    {
        if(this.resizeHandler)
        {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        this.renderer.dispose();
        this.renderer.domElement.remove();
    }

    public handleResize(camera:THREE.PerspectiveCamera):void
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

};

