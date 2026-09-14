import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { GLOBAL_BUS } from './core/EventBus.js';
import { FileLoader } from './core/utils/FileLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const engine = new Engine(document.body);
engine.start();

const uiManager = new UIManager(engine.renderEngine.renderer.domElement);

const inputManager = new InputManager({
    'KeyW': 'move:forward',
    'KeyS': 'move:backward',
    'KeyA': 'move:left',
    'KeyD': 'move:right',
    'Space': 'move:up',
    'ShiftLeft': 'move:down',
});

inputManager.init();

const fileLoader = new FileLoader();

GLOBAL_BUS.on('action:add_object', ({ type }) => 
{
    if (type === 'cube') 
    {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.y = 0.5;
        engine.sceneManager.addObject(cube);
    }
    if(type === 'model'){
        fileLoader.getfile().then((contents) => 
        {
            const objLoader = new OBJLoader();
            const object = objLoader.parse(contents);
            object.traverse((child) => 
            {
                if (child.isMesh) 
                {
                    child.material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
                }
            });
            object.position.y = 0.5;
            object.position.x = 0.5;
            engine.sceneManager.addObject(object);
        }).catch((err) => 
        {
            console.error('Error loading model: ', err);
        });
    }
});

