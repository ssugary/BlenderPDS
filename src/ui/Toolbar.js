import { GLOBAL_BUS } from '../core/EventBus.js';

export class Toolbar
{
    constructor() 
    {
        this.btnAdd = document.getElementById('add');
        this.btnDelete = document.getElementById('deleteObject');
        this.btnTranslate = document.getElementById('translate');
        this.btnRotate = document.getElementById('rotate');
        this.btnScale = document.getElementById('scale');
        this.btnWalkNav = document.getElementById('walkNav');
        this.btnEditMode = document.getElementById('editMode');
        this.btnVertex = document.getElementById('vertex');
        this.btnEdge = document.getElementById('edge');
        this.btnFace = document.getElementById('face');

        this.selectGeometry = document.getElementById('addGeometry');

        this.btnAddModel = document.getElementById('addModel');
        this.btnExportModel = document.getElementById('exportModel');
        this.bindEvents();
        this.listenSystemState();
    }

    bindEvents() 
    {
        this.btnAdd?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('action:add_object', { type: this.selectGeometry.value });
        });

        this.btnDelete?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('action:delete_object');
        });

        this.btnAddModel?.addEventListener('click', () =>{
            GLOBAL_BUS.emit('action:add_object', { type: 'model' });
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

        this.btnEditMode?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('editor:toggle_mode')
        });

        this.btnVertex?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('tool:change', 'vertex')
        });

        this.btnEdge?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('tool:change', 'edge')
        });
        
        this.btnFace?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'face')
        });
        this.btnExportModel?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('action:export_model');
        });
    }

    listenSystemState() 
    {
        GLOBAL_BUS.on('tool:changed', (activeTool) => 
        {
            console.log(`ferramenta ativa: ${activeTool}`);
        });

        GLOBAL_BUS.on('editor:mode_changed', (mode) => 
        {
            console.log(`modo do editor: ${mode}`)
        });
    }
}