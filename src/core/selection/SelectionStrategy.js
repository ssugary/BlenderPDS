import * as THREE from 'three';

export class SelectionStrategy 
{
    usesMeshAsPickTarget() 
    { 
        return false; 
    }              
    
    createPickHelper() 
    { 
        return null; 
    }                   
    
    updatePickHelper(pickHelper, heMesh) {}
    
    pick(heMesh, intersect) 
    { 
        return {elements: [], vertices: []}; 
    }
    
    createHighlightObject() 
    { 
        return null; 
    }
    
    updateHighlightObject(highlightObject, heMesh, elements, vertices) {}
    
    supportsExtrude() 
    { 
        return false; 
    }
}

export class VertexSelectionStrategy extends SelectionStrategy 
{

    constructor()
    {
        super();
    }

    createPickHelper() 
    {
        return new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x00ffff, size: 0.15 }));
    }

    updatePickHelper(pickHelper, heMesh) 
    {
        const positions = [];
        heMesh.vertices.forEach(v => positions.push(v.position.x, v.position.y, v.position.z));

        pickHelper.geometry.dispose();
        pickHelper.geometry = new THREE.BufferGeometry();
        pickHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    pick(heMesh, intersect) 
    { 
        if(intersect.index === undefined) 
            return {elements: [], vertices: []};

        const vertex = heMesh.vertices[intersect.index];
        return {elements: [vertex], vertices: [vertex]};
    }
    
    createHighlightObject() 
    {
        return new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffff00, size: 0.25 }));
    }

    updateHighlightObject(highlightObject, heMesh, elements, vertices) 
    {
        const positions = [];
        vertices.forEach(v => positions.push(v.position.x, v.position.y, v.position.z));

        highlightObject.geometry.dispose();
        highlightObject.geometry = new THREE.BufferGeometry();
        highlightObject.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }
}

export class FaceSelectionStrategy extends SelectionStrategy 
{
    constructor()
    {
        super();
    }

    usesMeshAsPickTarget() 
    { 
        return true; 
    } 

    pick(heMesh, intersect) 
    {
        if(intersect.faceIndex === undefined) 
            return {elements: [], vertices: []};

        const face = heMesh.faces[intersect.faceIndex];
        if(!face) 
            return {elements: [], vertices: []};

        const group = heMesh.getCoplanarGroup(face);
        return {elements: group, vertices: heMesh.getGroupVertices(group)};
    }

    createHighlightObject() 
    {
        return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true, side: THREE.DoubleSide}));
    }

    updateHighlightObject(highlightObject, heMesh, elements) 
    {
        const positions = [];
        elements.forEach(face => 
            heMesh.faceVertices(face).forEach(v => positions.push(v.position.x, v.position.y, v.position.z)));

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

    supportsExtrude() 
    { 
        return true; 
    }

}

export class EdgeSelectionStrategy extends SelectionStrategy 
{
    constructor() 
    {
        super();
        this.uniqueEdges = [];
    }

    createPickHelper() 
    {
        return new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ffff }));
    }

    pick(heMesh, intersect) 
    {
        if(intersect.index === undefined) 
            return {elements: [], vertices: []};

        const entry = this.uniqueEdges[Math.floor(intersect.index / 2)];

        if(!entry) 
            return {elements: [], vertices: []};

        return {elements: [entry.edge], vertices: [entry.v0, entry.v1]};
    }

    updatePickHelper(pickHelper, heMesh) 
    {
        this.uniqueEdges = heMesh.getUniqueEdges();
        const positions = [];
        this.uniqueEdges.forEach(entry => 
        {
            positions.push(
                entry.v0.position.x, entry.v0.position.y, entry.v0.position.z,
                entry.v1.position.x, entry.v1.position.y, entry.v1.position.z
            );
        });

        pickHelper.geometry.dispose();
        pickHelper.geometry = new THREE.BufferGeometry();
        pickHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }


    createHighlightObject() 
    {
        return new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 3 }));
    }

    updateHighlightObject(highlightObject, heMesh, elements, vertices) 
    {
        const [v0, v1] = vertices;
        const positions = [v0.position.x, v0.position.y, v0.position.z, v1.position.x, v1.position.y, v1.position.z];

        highlightObject.geometry.dispose();
        highlightObject.geometry = new THREE.BufferGeometry();
        highlightObject.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

}
