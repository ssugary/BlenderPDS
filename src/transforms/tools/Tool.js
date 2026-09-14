import { TransformCommand } from '../commands/Command.js'; 

export class Tool 
{
    activate(selectedObject) {}
    deactivate() {}
    captureState(object) {}                   
    createCommand(object, before, after) {}     
}

export class TransformTool extends Tool 
{
    constructor(controls, commandManager, mode) 
    {
        super();
        this.controls = controls;
        this.commandManager = commandManager;
        this.mode = mode;
    }
    activate(selectedObject) 
    {
        this.controls.setMode(this.mode);
        selectedObject ? this.controls.attach(selectedObject) : this.controls.detach();
    }
    captureState(object)
    { 
        return object.matrix.clone(); 
    }
    createCommand(object, before, after) 
    { 
        return new TransformCommand(object, before, after); 
    }
}