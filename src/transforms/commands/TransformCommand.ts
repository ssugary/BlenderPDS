import {  Matrix4, Object3D } from "three";
import { Command } from "./Command.js";

export class TransformCommand extends Command 
{
    private object:Object3D;
    private oldMatrix:Matrix4;
    private newMatrix:Matrix4;
    
    constructor(object3D:Object3D, oldMatrix:Matrix4, newMatrix:Matrix4) 
    {
        super();
        this.object = object3D;
        this.oldMatrix = oldMatrix.clone();
        this.newMatrix = newMatrix.clone();
    }

    public execute():void
    {        
        this.object.matrix.copy(this.newMatrix);
        this.object.matrix.decompose(this.object.position, this.object.quaternion, this.object.scale);
    }

    public undo():void
    {
        this.object.matrix.copy(this.oldMatrix);
        this.object.matrix.decompose(this.object.position, this.object.quaternion, this.object.scale);
    }

    public redo():void
    {
        this.execute();
    }
}