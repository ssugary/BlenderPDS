import { Toolbar } from './Toolbar.js';
import { Viewport } from './Viewport.js';

export class UIManager 
{
    constructor(canvasElement) 
    {
        this.toolbar = new Toolbar();
        this.viewport = new Viewport(canvasElement);
    }
}