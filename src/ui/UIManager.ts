import { Toolbar } from './Toolbar.js';
import { Viewport } from './Viewport.js';

export class UIManager 
{
    private toolbar:Toolbar;
    private viewport:Viewport;
    constructor(canvasElement:HTMLCanvasElement) 
    {
        this.toolbar = new Toolbar();
        this.viewport = new Viewport(canvasElement);
    }
}