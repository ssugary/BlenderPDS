import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
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
    'KeyE': 'action:extrude',
    'Tab': 'editor:toggle',
    'KeyX': 'action:delete_object',
    'Delete': 'action:delete_object',
    'Backspace': 'action:delete_object',
    'KeyZ': 'system:undo',
    'KeyY': 'system:redo',
    'KeyG': 'tool:translate',
    'KeyR': 'tool:rotate',
    'KeyC': 'tool:scale'
});

inputManager.init();




