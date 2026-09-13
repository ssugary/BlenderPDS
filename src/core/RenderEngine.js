import * as THREE from 'three';

export class RenderEngine
{
    constructor(sceneManager, containerElement)
    {

        this.sceneManager = sceneManager;
        this.container = containerElement || document.body;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);
        this.bindEvents();
    };

    render(camera) 
    {
        this.renderer.render(this.sceneManager.getNativeScene(), camera);
    }

    bindEvents() 
    {
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

};

