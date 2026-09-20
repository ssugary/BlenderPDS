import { GLOBAL_BUS } from '../core/EventBus';

export class Toolbar
{
    private btnAdd: HTMLButtonElement | null;
    private btnDelete: HTMLButtonElement | null;
    private btnTranslate: HTMLButtonElement | null;
    private btnRotate: HTMLButtonElement | null;
    private btnScale: HTMLButtonElement | null;
    private btnWalkNav: HTMLButtonElement | null;
    private btnEditMode: HTMLButtonElement | null;
    private btnVertex: HTMLButtonElement | null;
    private btnEdge: HTMLButtonElement | null;
    private btnFace: HTMLButtonElement | null;

    private selectGeometry: HTMLSelectElement | null;

    private btnAddModel: HTMLButtonElement | null;
    private btnExportModel: HTMLButtonElement | null;

    public constructor() 
    {
        this.btnAdd = document.getElementById('add') as HTMLButtonElement | null;
        this.btnDelete = document.getElementById('deleteObject') as HTMLButtonElement | null;
        this.btnTranslate = document.getElementById('translate') as HTMLButtonElement | null;
        this.btnRotate = document.getElementById('rotate') as HTMLButtonElement | null;
        this.btnScale = document.getElementById('scale') as HTMLButtonElement | null;
        this.btnWalkNav = document.getElementById('walkNav') as HTMLButtonElement | null;
        this.btnEditMode = document.getElementById('editMode') as HTMLButtonElement | null;
        this.btnVertex = document.getElementById('vertex') as HTMLButtonElement | null;
        this.btnEdge = document.getElementById('edge') as HTMLButtonElement | null;
        this.btnFace = document.getElementById('face') as HTMLButtonElement | null;

        this.selectGeometry = document.getElementById('addGeometry') as HTMLSelectElement | null;

        this.btnAddModel = document.getElementById('addModel') as HTMLButtonElement | null;
        this.btnExportModel = document.getElementById('exportModel') as HTMLButtonElement | null;
        
        this.bindEvents();
        this.listenSystemState();
    }

    private bindEvents(): void 
    {
        this.btnAdd?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('action:add_object', { type: this.selectGeometry?.value });
        });

        this.btnDelete?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('action:delete_object', undefined);
        });

        this.btnAddModel?.addEventListener('click', () =>
        {
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
            GLOBAL_BUS.emit('camera:change_mode', undefined);
        });

        this.btnEditMode?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('editor:toggle_mode', undefined);
        });

        this.btnVertex?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('tool:change', 'vertex');
        });

        this.btnEdge?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('tool:change', 'edge');
        });
        
        this.btnFace?.addEventListener('click', () => 
        {
            GLOBAL_BUS.emit('tool:change', 'face');
        });

        this.btnExportModel?.addEventListener('click', () =>
        {
            GLOBAL_BUS.emit('action:export_model', undefined);
        });
    }

    private listenSystemState(): void 
    {
        GLOBAL_BUS.on('tool:changed', (activeTool: any) => 
        {
            console.log(`ferramenta ativa: ${activeTool}`);
        });

        GLOBAL_BUS.on('editor:mode_changed', (mode: any) => 
        {
            console.log(`modo do editor: ${mode}`);
        });
    }
}
