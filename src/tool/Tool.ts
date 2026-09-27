
//this needs to be refactored into a interface
export class Tool 
{
    activate(selectedObject:any):void {}
    deactivate():void {}
    captureState(object:any) {}                   
    createCommand(object:any, before:any, after:any):any {}     
}
