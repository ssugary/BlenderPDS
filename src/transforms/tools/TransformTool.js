import { Tool } from "./Tool.js";
import { TransformCommand } from '../commands/TransformCommand.js';

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