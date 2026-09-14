import { Command } from './Command.js';

export class FaceMoveCommand extends Command 
{
    constructor(mesh, heVertices, oldPositions, newPositions) 
    {
        super();
        this.mesh = mesh;
        this.heVertices = heVertices;
        this.oldPositions = oldPositions.map(p => p.clone());
        this.newPositions = newPositions.map(p => p.clone());
    }

    apply(positions) 
    {
        this.heVertices.forEach((v, i) => v.position.copy(positions[i]));
        this.mesh.geometry.dispose();
        this.mesh.geometry = this.mesh.userData.heMesh.toBufferGeometry();
    }

    execute() 
    { 
        this.apply(this.newPositions); 
    }
    undo()    
    { 
        this.apply(this.oldPositions);
     }
    redo()    
    { 
        this.execute(); 
    }
}

export class FaceExtrudeCommand extends Command 
{
    constructor(mesh, beforeGeo, afterGeo, rebuild) 
    {
        super();
        this.mesh = mesh;
        this.beforeGeo = beforeGeo;   
        this.afterGeo = afterGeo;
        this.rebuild = rebuild;       
    }

    execute() { this.rebuild(this.mesh, this.afterGeo); }
    undo()    { this.rebuild(this.mesh, this.beforeGeo); }
    redo()    { this.execute(); }
}