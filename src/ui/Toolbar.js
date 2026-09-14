import { GLOBAL_BUS } from '../core/EventBus.js';

export class Toolbar
{
    constructor() 
    {
        this.btnAddCube = document.getElementById('addCube');
        this.btnTranslate = document.getElementById('translate');
        this.btnRotate = document.getElementById('rotate');
        this.btnScale = document.getElementById('scale');
        this.btnWalkNav = document.getElementById('walkNav');
        this.btnDistortion = document.getElementById('distortion');
        this.btnFaces = document.getElementById('faces');

        this.bindEvents();
        this.listenSystemState();
    }

    bindEvents() 
    {
        this.btnAddCube?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('action:add_object', { type: 'cube' });
        });

        this.btnTranslate?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'translate');
        });

        this.btnRotate?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'rotate');
        });

        this.btnScale?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'scale');
        });

        this.btnWalkNav?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('camera:change_mode');
        });

        this.btnDistortion?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'distortion');
        });

        this.btnFaces?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'face');
        });
    }

    listenSystemState() 
    {
        GLOBAL_BUS.on('tool:changed', (activeTool) => 
        {
            console.log(`[UI] Atualizando destaque visual da ferramenta: ${activeTool}`);
        });
    }
}