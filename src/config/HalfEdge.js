import * as THREE from 'three';

export class HEVertex 
{
    constructor(x, y, z) 
    {
        this.position = new THREE.Vector3(x, y, z);
        this.halfEdge = null; 
    }
}

export class HEFace 
{
    constructor() 
    {
        this.halfEdge = null; 
    }
}

export class HEEdge 
{
    constructor() 
    {
        this.vertex = null; 
        this.twin = null;   
        this.next = null;   
        this.prev = null;   
        this.face = null;   
    }
}

export class HEMesh 
{
    constructor() 
    {
        this.vertices = [];
        this.faces = [];
        this.edges = [];
    }


    faceVertices(face) 
    {
        const verts = [];
        let edge = face.halfEdge;
        do 
        { 
            verts.push(edge.vertex); edge = edge.next; 
        } while(edge !== face.halfEdge);
        
        return verts;
    }
    computeNormal(face) 
    {
        const [a, b, c] = this.faceVertices(face);

        const ab = a.position.clone().sub(b.position);
        const cb = c.position.clone().sub(b.position);

        return cb.cross(ab).normalize();
    }

    getCoplanarGroup(startFace, dotThreshold = 0.999) 
    {
        const groupNormal = this.computeNormal(startFace);
        const visited = new Set([startFace]);
        const stack = [startFace];

        while(stack.length) 
        {
            const face = stack.pop();
            let edge = face.halfEdge;
            do 
            {
                const twin = edge.twin;

                if (twin && !visited.has(twin.face) && this.computeNormal(twin.face).dot(groupNormal) > dotThreshold) 
                {
                    visited.add(twin.face);
                    stack.push(twin.face);
                }

                edge = edge.next;

            } while(edge !== face.halfEdge);
        }

        return Array.from(visited);
    }

    getGroupVertices(faces) 
    {
        const set = new Set();
        faces.forEach(f => this.faceVertices(f).forEach(v => set.add(v)));

        return Array.from(set);
    }

    getGroupBoundaryEdges(faces) 
    {
        const faceSet = new Set(faces);
        const boundary = [];
        faces.forEach(face => 
        {
            let edge = face.halfEdge;
            do 
            {
                if (!edge.twin || !faceSet.has(edge.twin.face)) 
                    boundary.push(edge);
                edge = edge.next;
            } while(edge !== face.halfEdge);
        });
        return boundary;
    }

    extrudeFaceGroup(faces) 
    {
        const boundaryEdges = this.getGroupBoundaryEdges(faces);
        const groupVerts = this.getGroupVertices(faces);

        const byOrigin = new Map(boundaryEdges.map(e => [e.vertex, e]));
        const loopVerts = [];
        let current = boundaryEdges[0];
        const guard = boundaryEdges.length + 1;

        for(let i = 0; i < guard && current; i++) 
        {
            loopVerts.push(current.vertex);
            current = byOrigin.get(current.next.vertex);
            if (current === boundaryEdges[0])
                break;
        }

        const vertMap = new Map();
        groupVerts.forEach(v => 
        {
            const nv = new HEVertex(v.position.x, v.position.y, v.position.z);
            this.vertices.push(nv);
            vertMap.set(v, nv);
        });

        faces.forEach(face => 
        {
            let edge = face.halfEdge;
            do 
            {
                edge.vertex = vertMap.get(edge.vertex);
                edge.vertex.halfEdge = edge;
                edge = edge.next;
            } while(edge !== face.halfEdge);
        });

        const n = loopVerts.length;
        for(let i = 0; i < n; i++) 
        {
            const nextI = (i + 1) % n;
            const v0 = loopVerts[i], v1 = loopVerts[nextI];
            const v2 = vertMap.get(v1), v3 = vertMap.get(v0);

            const f1 = new HEFace();
            const he1_0 = new HEEdge(); he1_0.vertex = v0; he1_0.face = f1;
            const he1_1 = new HEEdge(); he1_1.vertex = v1; he1_1.face = f1;
            const he1_2 = new HEEdge(); he1_2.vertex = v2; he1_2.face = f1;
            he1_0.next = he1_1; he1_1.next = he1_2; he1_2.next = he1_0;
            f1.halfEdge = he1_0;

            const f2 = new HEFace();
            const he2_0 = new HEEdge(); he2_0.vertex = v0; he2_0.face = f2;
            const he2_1 = new HEEdge(); he2_1.vertex = v2; he2_1.face = f2;
            const he2_2 = new HEEdge(); he2_2.vertex = v3; he2_2.face = f2;
            he2_0.next = he2_1; he2_1.next = he2_2; he2_2.next = he2_0;
            f2.halfEdge = he2_0;

            this.faces.push(f1, f2);
            this.edges.push(he1_0, he1_1, he1_2, he2_0, he2_1, he2_2);
        }

        this.recalculateTwins();
    }



    fromBufferGeometry(geometry) 
    {
        const positions = geometry.attributes.position;
        const indices = geometry.index ? geometry.index.array : null;

        if(!indices) 
            return;
        
        const vertexMap = new Map();
        const originalToLogical = new Array(positions.count);

        for(let i = 0; i < positions.count; i++) 
        {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;

            if(!vertexMap.has(key)) 
            {
                const newVert = new HEVertex(x, y, z);
                this.vertices.push(newVert);
                vertexMap.set(key, newVert);
            }
            originalToLogical[i] = vertexMap.get(key);
        }

        const edgeMap = new Map(); 

        for(let i = 0; i < indices.length; i += 3) 
        {
            const v0 = originalToLogical[indices[i]];
            const v1 = originalToLogical[indices[i + 1]];
            const v2 = originalToLogical[indices[i + 2]];

            const face = new HEFace();
            this.faces.push(face);

            const he0 = new HEEdge();
            const he1 = new HEEdge();
            const he2 = new HEEdge();

            face.halfEdge = he0;

            v0.halfEdge = he0;
            v1.halfEdge = he1;
            v2.halfEdge = he2;

            he0.vertex = v0; he0.face = face; he0.next = he1; he0.prev = he2;
            he1.vertex = v1; he1.face = face; he1.next = he2; he1.prev = he0;
            he2.vertex = v2; he2.face = face; he2.next = he0; he2.prev = he1;

            this.edges.push(he0, he1, he2);

            const connectTwin = (edge, fromVert, toVert) => 
            {
                const edgeKey = `${toVert.position.toArray().join(',')}-${fromVert.position.toArray().join(',')}`;
                if (edgeMap.has(edgeKey)) 
                {
                    const twinEdge = edgeMap.get(edgeKey);
                    edge.twin = twinEdge;
                    twinEdge.twin = edge;
                    edgeMap.delete(edgeKey); 
                } 
                else 
                {
                    const reverseKey = `${fromVert.position.toArray().join(',')}-${toVert.position.toArray().join(',')}`;
                    edgeMap.set(reverseKey, edge);
                }
            };

            connectTwin(he0, v0, v1);
            connectTwin(he1, v1, v2);
            connectTwin(he2, v2, v0);
        }
    }

    toBufferGeometry() 
    {
        const positions = [];
        const indices = [];
        const vertexToIndex = new Map();

        this.vertices.forEach((v, index) => 
        {
            positions.push(v.position.x, v.position.y, v.position.z);
            vertexToIndex.set(v, index);
        });
        
        this.faces.forEach(face => 
        {
            let edge = face.halfEdge;
            const faceIndices = [];
            
            do 
            {
                faceIndices.push(vertexToIndex.get(edge.vertex));
                edge = edge.next;
            } while(edge !== face.halfEdge);

            if (faceIndices.length === 3) 
                indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
            
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(indices); 
        geo.computeVertexNormals();
        geo.computeBoundingSphere();
        geo.computeBoundingBox();
        
        return geo;
    }

    recalculateTwins() 
    {
        const edgeMap = new Map();
        this.edges.forEach(e => e.twin = null); 

        this.edges.forEach(edge => 
        {
            const fromVert = edge.vertex;
            const toVert = edge.next.vertex;
            
            const key = `${toVert.position.x},${toVert.position.y},${toVert.position.z}-${fromVert.position.x},${fromVert.position.y},${fromVert.position.z}`;
            
            if (edgeMap.has(key)) 
            {
                const twin = edgeMap.get(key);
                edge.twin = twin;
                twin.twin = edge;
                edgeMap.delete(key);
            } 
            else 
            {
                const revKey = `${fromVert.position.x},${fromVert.position.y},${fromVert.position.z}-${toVert.position.x},${toVert.position.y},${toVert.position.z}`;
                edgeMap.set(revKey, edge);
            }
        });
    }

    getUniqueEdges() 
    {
        const seen = new Set();
        const result = [];

        this.edges.forEach(edge => 
        {
            if(seen.has(edge) || (edge.twin && seen.has(edge.twin))) 
                return;

            seen.add(edge);
            result.push({edge, v0: edge.vertex, v1: edge.next.vertex});
        });

        return result;
    }


}