export class Command 
{
    execute() {}
    undo() {}
    redo() {} 
}

export class TransformCommand extends Command 
{
    constructor(object3D, oldMatrix, newMatrix) 
    {
        super();
        this.object = object3D;
        this.oldMatrix = oldMatrix.clone();
        this.newMatrix = newMatrix.clone();
    }

    execute()
    {        
        this.object.matrix.copy(this.newMatrix);
        this.object.matrix.decompose(this.object.position, this.object.quaternion, this.object.scale);
    }

    undo() 
    {
        this.object.matrix.copy(this.oldMatrix);
        this.object.matrix.decompose(this.object.position, this.object.quaternion, this.object.scale);
    }
}