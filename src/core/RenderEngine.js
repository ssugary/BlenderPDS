import * as THREE from 'three';

export class RenderEngine
{
    constructor(sceneManager, containerElement, camera)
    {

        this.sceneManager = sceneManager;
        this.container = containerElement || document.body;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);
    };

    render(camera) 
    {
        this.renderer.render(this.sceneManager.getNativeScene(), camera);
    }

    bindEvents(camera) 
    {
        window.addEventListener('resize', () => this.handleResize(camera));
    }

    handleResize(camera) 
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

};

