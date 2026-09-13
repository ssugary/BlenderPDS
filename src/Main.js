import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { GLOBAL_BUS } from './core/EventBus.js';

const engine = new Engine(document.body);
engine.start();

const uiManager = new UIManager(engine.renderEngine.renderer.domElement);

const inputManager = new InputManager({
    'KeyG': 'tool:translate',
    'KeyR': 'tool:rotate',
    'KeyS': 'tool:scale',
    'KeyW': 'move:forward',
    'KeyS': 'move:backward',
    'KeyA': 'move:left',
    'KeyD': 'move:right',
    'Space': 'move:up',
    'ShiftLeft': 'move:down',
});

inputManager.init();

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
});


GLOBAL_BUS.on('camera:change_mode', () => 
{
    engine.cameraManager.changeMode();
});