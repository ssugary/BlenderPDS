import { GLOBAL_BUS } from '../core/EventBus.js';

export class Viewport
{
    constructor(domElement) 
    {
        this.domElement = domElement;
        this.pointerDownCoords = { x: 0, y: 0 };
        this.bindEvents();
    }

    bindEvents() 
    {
        this.domElement.addEventListener('pointerdown', (e) => 
        {
            if (e.button !== 0) 
                return;
            this.pointerDownCoords = { x: e.clientX, y: e.clientY };
        });

        this.domElement.addEventListener('pointerup', (e) => 
        {
            if (e.button !== 0) 
                return;
            
            const dist = Math.hypot(e.clientX - this.pointerDownCoords.x, e.clientY - this.pointerDownCoords.y);
            if (dist > 5) 
                return; 

            const rect = this.domElement.getBoundingClientRect();
            const coords = {
                x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((e.clientY - rect.top) / rect.height) * 2 + 1
            };

            GLOBAL_BUS.emit('ui:canvas_clicked', coords);
        });
    }

}