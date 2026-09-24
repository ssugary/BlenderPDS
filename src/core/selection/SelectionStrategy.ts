import * as THREE from 'three';
import { HEEdge, HEFace, HEMesh, HEVertex } from '../../config/HalfEdge';

export abstract class SelectionStrategy<T extends THREE.Object3D = THREE.Object3D>
{
    abstract usesMeshAsPickTarget():boolean;          
    
    abstract createPickHelper():T;               
    
    abstract updatePickHelper(pickHelper:T, heMesh:HEMesh):void;
    
    abstract pick(heMesh:HEMesh, intersect:any):any;
    
    abstract createHighlightObject():T;
    
    abstract updateHighlightObject(highlightObject:T, heMesh:HEMesh, elements:any, vertices:Array<HEVertex>):void;
    
    abstract supportsExtrude():boolean;

    abstract supportsEdgeSplit():boolean;
}

export class VertexSelectionStrategy extends SelectionStrategy<THREE.Points> 
{

    constructor()
    {
        super();
    }

    public usesMeshAsPickTarget():boolean
    {
        return false;
    }

    public createPickHelper():THREE.Points
    {
        return new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x00ffff, size: 0.15 }));
    }

    public updatePickHelper(pickHelper:THREE.Points, heMesh:HEMesh):void
    {
        const positions = new Array<number>;
        heMesh.vertices.forEach((v:HEVertex) => positions.push(v.getXYZ().x, v.getXYZ().y, v.getXYZ().z));

        pickHelper.geometry.dispose();
        pickHelper.geometry = new THREE.BufferGeometry();
        pickHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    public pick(heMesh:HEMesh, intersect:any) // não sei que tipo de dado entra em intersect :(
    { 
        if(intersect.index === undefined) 
            return {elements: [], vertices: []};

        const vertex = heMesh.getVertices()[intersect.index];

        return {elements: [vertex], vertices: [vertex]};
    }
    
    public createHighlightObject():THREE.Points 
    {
        return new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffff00, size: 0.25 }));
    }

    public updateHighlightObject(highlightObject:THREE.Points, heMesh:HEMesh, elements:any, vertices:Array<HEVertex>):void //WARNING: some atributes are not used here
    {
        const positions = new Array<number>;
        vertices.forEach((v:HEVertex) => positions.push(v.getXYZ().x, v.getXYZ().y, v.getXYZ().z));

        highlightObject.geometry.dispose();
        highlightObject.geometry = new THREE.BufferGeometry();
        highlightObject.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    public supportsExtrude():boolean
    {
        return false;
    }

    public supportsEdgeSplit():boolean
    {
        return false;
    }
}

export class FaceSelectionStrategy extends SelectionStrategy<THREE.Mesh>
{
    constructor()
    {
        super();
    }

    public updatePickHelper(pickHelper: any, heMesh: any):void 
    {
        return;    
    }

    public usesMeshAsPickTarget():boolean
    { 
        return true; 
    } 

    public createPickHelper(): THREE.Mesh 
    {
        return new THREE.Mesh
    }

    public pick(heMesh:HEMesh, intersect:any) 
    {
        if(intersect.faceIndex === undefined) 
            return {elements: [], vertices: []};

        const face = heMesh.faces[intersect.faceIndex];
        if(!face) 
            return {elements: [], vertices: []};

        const group = heMesh.getCoplanarGroup(face);
        return {elements: group, vertices: heMesh.getGroupVertices(group)};
    }

    public createHighlightObject():THREE.Mesh
    {
        return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true, side: THREE.DoubleSide}));
    }

    public updateHighlightObject(highlightObject:THREE.Mesh, heMesh:HEMesh, elements:any) // não sei oq é element, e acho q isso aq nunca é chamado
    {
        const positions = new Array<number>;
        elements.forEach((face:HEFace) => 
            heMesh.faceVertices(face).forEach((v:HEVertex) => positions.push(v.getXYZ().x, v.getXYZ().y, v.getXYZ().z)));

        const attr = highlightObject.geometry.attributes.position;
        if(attr && attr.count === positions.length / 3) 
        {
            attr.array.set(positions);
            attr.needsUpdate = true;
        } 
        else 
            highlightObject.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        highlightObject.geometry.computeVertexNormals();
    }

    public supportsExtrude():boolean
    { 
        return true; 
    }

    public supportsEdgeSplit():boolean
    {
        return false;
    }

}

export class EdgeSelectionStrategy extends SelectionStrategy<THREE.LineSegments>
{
    public uniqueEdges:any;
    constructor() 
    {
        super();
        this.uniqueEdges = [];
    }

    public supportsExtrude(): boolean 
    {
        return false;
    }

    public supportsEdgeSplit():boolean
    {
        return true;
    }

    public usesMeshAsPickTarget(): boolean 
    {
        return false;
    }

    public createPickHelper():THREE.LineSegments
    {
        return new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ffff }));
    }

    public pick(heMesh:HEMesh, intersect:any) // pick is never used
    {
        if(intersect.index === undefined) 
            return {elements: [], vertices: []};

        const entry = this.uniqueEdges[Math.floor(intersect.index / 2)];

        if(!entry) 
            return {elements: [], vertices: []};

        return {elements: [entry.edge], vertices: [entry.v0, entry.v1]};
    }

    public updatePickHelper(pickHelper:THREE.LineSegments, heMesh:HEMesh):void
    {
        this.uniqueEdges = heMesh.getUniqueEdges();
        const positions = new Array<number>;
        this.uniqueEdges.forEach((entry:{ edge: HEEdge; v0: HEVertex; v1: HEVertex }) => 
        {
            positions.push(
                entry.v0.getXYZ().x, entry.v0.getXYZ().y, entry.v0.getXYZ().z,
                entry.v1.getXYZ().x, entry.v1.getXYZ().y, entry.v1.getXYZ().z
            );
        });

        pickHelper.geometry.dispose();
        pickHelper.geometry = new THREE.BufferGeometry();
        pickHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }


    public createHighlightObject():THREE.LineSegments
    {
        return new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 3 }));
    }

    public updateHighlightObject(highlightObject:THREE.LineSegments, heMesh:HEMesh, elements:any, vertices:Array<HEVertex>):void
    {
        const [v0, v1] = vertices;
        const positions = [v0.getXYZ().x, v0.getXYZ().y, v0.getXYZ().z, v1.getXYZ().x, v1.getXYZ().y, v1.getXYZ().z];

        highlightObject.geometry.dispose();
        highlightObject.geometry = new THREE.BufferGeometry();
        highlightObject.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

}
