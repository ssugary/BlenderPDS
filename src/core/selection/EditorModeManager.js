import { GLOBAL_BUS } from '../EventBus.ts';

export class EditorModeManager 
{
    constructor(objectMode, editMode) 
    {
        this.modes = { object: objectMode, edit: editMode };
        this.current = 'object';
        this.active = this.modes.object;
    }

    setMode(mode, payload) 
    {
        if (mode === this.current) 
            return;

        this.active.exit();
        this.current = mode;
        this.active = this.modes[mode];
        this.active.enter(payload);

        GLOBAL_BUS.emit('editor:mode_changed', mode);
    }

    toggle(selectedObject) 
    {
        if (this.current === 'object') 
        {
            if (!selectedObject) 
                return; 
            this.setMode('edit', selectedObject);
        } 
        else 
            this.setMode('object');
    }
}