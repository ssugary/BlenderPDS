import { SceneManager } from './core/SceneManager.js';
import { RenderEngine } from './core/RenderEngine.js';
import { InputManager } from './core/InputManager.js';
import { GLOBAL_BUS } from './core/EventBus.js';
import { UIManager } from './ui/UIManager.js';

const sceneManager = new SceneManager();
const renderEngine = new RenderEngine(sceneManager);

renderEngine.start();

const uiManager = new UIManager(renderEngine.renderer.domElement);

const inputManager = new InputManager({
    'KeyG': 'tool:translate',
    'KeyR': 'tool:rotate',
    'KeyS': 'tool:scale',
    'F1'  : 'camera:change_mode', 
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
        sceneManager.addObject(cube);
    }
});

GLOBAL_BUS.on('camera:change_mode', () => 
{
    renderEngine.cameraController.changeMode();
});