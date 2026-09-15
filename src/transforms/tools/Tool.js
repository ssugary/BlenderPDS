import { TransformCommand } from '../commands/Command.js'; 

export class Tool 
{
    activate(selectedObject) {}
    deactivate() {}
    captureState(object) {}                   
    createCommand(object, before, after) {}     
}