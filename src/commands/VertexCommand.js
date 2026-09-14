import { Command } from './Command.js';

export class VertexCommand extends Command 
{
    constructor(mesh, vertexIndex, oldVector3, newVector3) 
    {
        super();
        this.mesh = mesh;
        this.geometry = mesh.geometry;
        this.vertexIndices = [...vertexIndex];
        this.oldPos = oldVector3.clone();
        this.newPos = newVector3.clone();
    }

    updateVertex(position) 
    {
        const positions = this.geometry.attributes.position;
        this.vertexIndices.forEach(idx => positions.setXYZ(idx, position.x, position.y, position.z));
        positions.needsUpdate = true;
        this.geometry.computeVertexNormals();
        this.geometry.computeBoundingSphere();
        this.geometry.computeBoundingBox();
    }

    execute() 
    {
        this.updateVertex(this.newPos);
    }

    undo() 
    {
        this.updateVertex(this.oldPos);
    }

    redo()
    {
        this.execute();
    }
}