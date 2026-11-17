import { Tool } from "../Tool";
import { Matrix4, Object3D } from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";

/**
 * Attaches the shared TransformControls in one mode (translate, rotate or scale) and captures the
 * matrix a gesture started from, which is what the command needs to undo it.
 */
export class TransformTool extends Tool 
{
    private controls:TransformControls;
    private mode:any;

    constructor(controls:TransformControls, mode:string) 
    {
        super();
        this.controls = controls;
        this.mode = mode;
    }
    activate(selectedObject:Object3D) 
    {
        this.controls.setMode(this.mode);
        selectedObject ? this.controls.attach(selectedObject) : this.controls.detach();
    }
    captureState(object:Object3D):Matrix4
    {
        // The matrix is refreshed on render, so refresh it here to be sure it matches position/rotation/scale.
        object.updateMatrix();
        return object.matrix.clone(); 
    }
}