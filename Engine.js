import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

class SceneController
{
    constructor()
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x282828);
        this.initEnvironment();
        
    };

    initEnvironment() 
    {
        const grid = new THREE.GridHelper(10, 10, 0xffffff, 0x444444);
        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 10, 7);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

        this.scene.add(grid, light, ambientLight);
    }

    add(object) 
    {
        this.scene.add(object);
    }
};

class TransformController
{
    constructor(camera, domElement, scene)
    {
        this.transform = new TransformControls(camera, domElement);
        this.orbit = new OrbitControls(camera, domElement);

        scene.add(this.transform);

        this.transform.addEventListener('dragging-changed', (e) => {
            this.orbit.enabled = !e.value;
        });

    }
    attach(mesh)
    {
        this.transform.attach(mesh);
    }

    setMode(mode)
    {
        this.transform.setMode(mode);
    }
};


class RenderEngine
{
    constructor()
    {

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);


        this.sceneController = new SceneController();
        this.transformController = new TransformController(this.camera, this.renderer.domElement, this.sceneController.scene);

        this.setup();
        this.animate = this.animate.bind(this);
        this.animate();
    };

    addCube() 
    {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.4 });
        const mesh = new THREE.Mesh(geo, mat);

        this.sceneController.add(mesh);
        this.transformController.attach(mesh); 
        
    }
    setup()
    {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'g') 
                this.transformController.setMode('translate');
            if (key === 'r') 
                this.transformController.setMode('rotate');
            if (key === 's') 
                this.transformController.setMode('scale');
        });

        const btnAdd = document.getElementById('addCube');
        const btnTrans = document.getElementById('translate');
        const btnRot = document.getElementById('rotate');
        const btnScale = document.getElementById('scale');

        if (btnAdd)
             btnAdd.onclick = () => this.addCube();
        if (btnTrans)
             btnTrans.onclick = () => this.transformController.setMode('translate');
        if (btnRot)
             btnRot.onclick = () => this.transformController.setMode('rotate');
        if (btnScale)
             btnScale.onclick = () => this.transformController.setMode('scale');
    }

    setTransformMode(mode)
    {
        this.transformController.setMode(mode);
    }

    animate() 
    {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.sceneController.scene, this.camera);
    }
};

const renderEngine = new RenderEngine(); 