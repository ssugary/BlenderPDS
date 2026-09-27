import { Tool } from "../Tool.js";
import { TransformCommand } from '../../command/implementation/TransformCommand.js';
import { Matrix4, Object3D } from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";
import { CommandManager } from "../../manager/CommandManager.js";

export class TransformTool extends Tool 
{
    private controls:TransformControls;
    private commandManager:CommandManager;
    private mode:any;

    constructor(controls:TransformControls, commandManager:CommandManager, mode:string) 
    {
        super();
        this.controls = controls;
        this.commandManager = commandManager;
        this.mode = mode;
    }
    activate(selectedObject:Object3D) 
    {
        this.controls.setMode(this.mode);
        selectedObject ? this.controls.attach(selectedObject) : this.controls.detach();
    }
    captureState(object:Object3D)
    { 
        return object.matrix.clone(); 
    }
    createCommand(object:Object3D, before:Matrix4, after:Matrix4) 
    { 
        return new TransformCommand(object, before, after); 
    }
}