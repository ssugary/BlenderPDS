import { Object3D } from 'three';
import { GLOBAL_BUS } from '../core/EventBus';
import { EditMode, EditorMode, ObjectMode } from '../entity/EditorMode';

/**
 * Holds the object and edit modes and swaps them, telling each one to enter/exit so it can
 * install or remove its tools. Announces the new mode on `editor:mode_changed`.
 */
export class EditorModeManager 
{
    private modes:Map<string,EditorMode>;
    public current:string;
    public active:EditorMode;

    constructor(objectMode:ObjectMode, editMode:EditMode) 
    {
        this.modes = new Map<string, any>([['object', objectMode], ['edit', editMode]]);
        this.current = 'object';
        this.active = objectMode;
    }

    setMode(mode:string, payload:Object3D|null) 
    {
        if (mode === this.current) 
            return;

        this.active.exit();
        this.current = mode;
        const m = this.modes.get(mode)
        if(m)
        this.active = m;
        this.active.enter(payload);

        GLOBAL_BUS.emit('editor:mode_changed', mode);
    }

    toggle(selectedObject:Object3D) 
    {
        if (this.current === 'object') 
        {
            if (!selectedObject) 
                return; 
            this.setMode('edit', selectedObject);
        } 
        else 
            this.setMode('object', null);
    }
}