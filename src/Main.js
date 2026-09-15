import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { GLOBAL_BUS } from './core/EventBus.js';
import { ObjectParser } from './core/ObjectParser.js';
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
});

inputManager.init();




