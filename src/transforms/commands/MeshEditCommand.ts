import { Tool } from '../tools/Tool.js';
import { Command } from './Command.js';
import { HEVertex } from '../../config/HalfEdge.js';
import { MeshEditTool } from '../tools/MeshEditTool.js';
import { Mesh, Vector3 } from 'three';

export class MeshEditCommand extends Command 
{
    public tool:Tool;
    public mesh:THREE.Mesh;
    public heVertices:Array<HEVertex>;
    public oldPositions:Array<Vector3>;
    public newPositions:Array<Vector3>;

    constructor(tool:Tool, mesh:THREE.Mesh, heVertices:Array<HEVertex>, oldPositions:Array<Vector3>, newPositions:Array<Vector3>) 
    {
        super();
        this.tool = tool;
        this.mesh = mesh;
        this.heVertices = heVertices;
        this.oldPositions = oldPositions.map((p:Vector3) => p.clone());
        this.newPositions = newPositions.map((p:Vector3) => p.clone());
    }

    apply(positions:Array<Vector3>) :void
    {
        this.heVertices.forEach((v:HEVertex, i:number) => v.getXYZ().copy(positions[i]));
        this.mesh.geometry.dispose();
        this.mesh.geometry = this.mesh.userData.heMesh.toBufferGeometry();
        

        if (this.tool instanceof MeshEditTool) 
        {
            this.tool.recenterGizmo();
            this.tool.updateHighlight();
            const pickHelper = this.tool.getPickhelper() 
            if (pickHelper) 
                this.tool.strategy.updatePickHelper(pickHelper, this.mesh.userData.heMesh);
            
        }

    }

    execute():void
    { 
        this.apply(this.newPositions);
    }
    undo():void    
    { 
        this.apply(this.oldPositions);
    }
    redo():void  
    { 
        this.execute();
    }
}

export class FaceExtrudeCommand extends Command 
{
    public mesh:Mesh;
    public beforeGeo:any;
    public afterGeo:any;
    public rebuild:any;
    constructor(mesh:Mesh, beforeGeo:any, afterGeo:any, rebuild:any) 
    {
        super();
        this.mesh = mesh;
        this.beforeGeo = beforeGeo;
        this.afterGeo = afterGeo;
        this.rebuild = rebuild;
    }

    execute() 
    { 
        this.rebuild(this.mesh, this.afterGeo);
    }

    undo()    
    { 
        this.rebuild(this.mesh, this.beforeGeo);
    }

    redo()    
    { 
        this.execute();
    }
}