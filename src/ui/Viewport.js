import { GLOBAL_BUS } from '../core/EventBus.js';

export class Viewport
{
    constructor(domElement) 
    {
        this.domElement = domElement;
        this.bindEvents();
    }

    bindEvents() 
    {
        this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    }

    onPointerDown(event) 
    {
        if (event.button !== 0) 
            return;

        const rect = this.domElement.getBoundingClientRect();

        const coords = {x: ((event.clientX - rect.left) / rect.width) * 2 - 1,y: -((event.clientY - rect.top) / rect.height) * 2 + 1};

        GLOBAL_BUS.emit('ui:canvas_clicked', coords);
    }
}