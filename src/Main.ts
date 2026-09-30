import { Engine } from './core/Engine.js';
import { InputManager } from './manager/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { Lobby } from './ui/Lobby.js';
import { ChatPanel } from './ui/ChatPanel.js';
import { GLOBAL_BUS } from './core/EventBus.js';

const session = await new Lobby().run();
if (session)
{
    GLOBAL_BUS.emit('network:connected', session);
    new ChatPanel(session);
}

document.getElementById('ui')!.style.display = '';

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
    'KeyP': 'action:split_edge',
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




