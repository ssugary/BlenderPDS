/**
 * Base class for the tools. The underscore-prefixed parameters are part of the override
 * contract (subclasses do use them) but not of these no-op defaults.
 */
export class Tool 
{
    activate(_selectedObject:any):void {}
    deactivate():void {}
    captureState(_object:any) {}                   
    createCommand(_object:any, _before:any, _after:any):any {}     
}
