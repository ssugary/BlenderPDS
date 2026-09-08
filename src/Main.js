import * as THREE from 'three';
import { GLOBAL_BUS } from './core/EventBus.js';
import { SceneManager } from './core/SceneManager.js';
import { RenderEngine } from './core/RenderEngine.js';
import { InputManager } from './core/InputManager.js';

const sceneManager = new SceneManager();

const renderEngine = new RenderEngine(sceneManager);
renderEngine.start();

const inputManager = new InputManager({
    'g': 'tool:translate',
    'r': 'tool:rotate',
    's': 'tool:scale',
    'KeyW': 'move:forward',
    'KeyS': 'move:backward',
    'KeyA': 'move:left',
    'KeyD': 'move:right',
    'Space': 'move:up',
    'ShiftLeft': 'move:down',
});

inputManager.init();

document.getElementById('addCube')?.addEventListener('click', () => 
    {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
    const cube = new THREE.Mesh(geo, mat);
    
    cube.position.y = 0.5; 
    sceneManager.addObject(cube);
});

document.getElementById('walkNav')?.addEventListener('click', () => {
    renderEngine.cameraController.setMode('walk');
});

window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.code === 'KeyF') {
        e.preventDefault();
        renderEngine.setNavigationMode('walk');
    }
});

GLOBAL_BUS.on('input:action', ({ action }) => {
    console.log(`Ação capturada sem acoplamento direto: ${action}`);
});