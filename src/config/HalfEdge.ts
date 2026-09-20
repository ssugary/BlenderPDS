import * as THREE from 'three';

export class HEVertex 
{
    public position?:THREE.Vector3;
    public halfEdge?:HEEdge;

    constructor(x:number, y:number, z:number) 
    {
        this.position = new THREE.Vector3(x, y, z);
        this.halfEdge = new HEEdge(); 
    }

    public setXYZ(x:number, y:number, z:number):void
    {
        this.position = new THREE.Vector3(x,y,z);
    }
    public getXYZ():THREE.Vector3
    {
        if(this.position) return this.position;
        else throw Error('HalfEdge position undefined');
    }

    public setHalfEdge(halfEdge:HEEdge):void
    {
        this.halfEdge = halfEdge;
    }
    public getHalfEdge():HEEdge
    {
        if(this.halfEdge) return this.halfEdge;
        else throw Error('HalfEdge undefined');
    }
}

export class HEFace 
{
    public halfEdge?:HEEdge;
    constructor() 
    {
        this.halfEdge = new HEEdge(); 
    }

    public setHalfEdge(halfEdge:HEEdge):void
    {
        this.halfEdge = halfEdge;
    }
    public getHalfEdge():HEEdge
    {
        if(this.halfEdge) return this.halfEdge;
        else throw Error('HalfFace halfEdge undefined');
    }
}

export class HEEdge {
    public vertex?: HEVertex;
    public twin?: HEEdge;
    public next?: HEEdge;
    public prev?: HEEdge;
    public face?: HEFace;

    constructor() {}

    public deleteTwin():void
    {
        this.twin = undefined;
    }

    public setVertex(vertex: HEVertex): void 
    {
        this.vertex = vertex;
    }
    public getVertex(): HEVertex {
        if (this.vertex) return this.vertex;
        else throw Error('HalfEdge vertex undefined');
    }

    public setTwin(twin: HEEdge): void {
        this.twin = twin;
    }
    public getTwin(): HEEdge {
        if (this.twin) return this.twin;
        else throw Error('HalfEdge twin undefined');
    }

    public setNext(next: HEEdge): void {
        this.next = next;
    }
    public getNext(): HEEdge {
        if (this.next) return this.next;
        else throw Error('HalfEdge next undefined');
    }

    public setPrev(prev: HEEdge): void {
        this.prev = prev;
    }
    public getPrev(): HEEdge {
        if (this.prev) return this.prev;
        else throw Error('HalfEdge prev undefined');
    }

    public setFace(face: HEFace): void {
        this.face = face;
    }
    public getFace(): HEFace {
        if (this.face) return this.face;
        else throw Error('HalfEdge face undefined');
    }

    public hasTwin(): boolean {
        return this.twin !== undefined;
    }
    public hasFace(): boolean {
        return this.face !== undefined;
    }
}

export class HEMesh 
{
    public vertices:Array<HEVertex>;
    public faces:Array<HEFace>;
    public edges:Array<HEEdge>;
    constructor() 
    {
        this.vertices = [];
        this.faces = [];
        this.edges = [];
    }

    public getVertices(): Array<HEVertex>
    {
        if (this.vertices) return this.vertices;
        else throw Error('HEMesh vertices undefined');
    }

    public setVertices(vertices: Array<HEVertex>): void
    {
        if (vertices) this.vertices = vertices;
        else throw Error('HEMesh vertices invalid');
    }

    public getFaces(): Array<HEFace>
    {
        if (this.faces) return this.faces;
        else throw Error('HEMesh faces undefined');
    }

    public setFaces(faces: Array<HEFace>): void
    {
        if (faces) this.faces = faces;
        else throw Error('HEMesh faces invalid');
    }

    public getEdges(): Array<HEEdge>
    {
        if (this.edges) return this.edges;
        else throw Error('HEMesh edges undefined');
    }

    public setEdges(edges: Array<HEEdge>): void
    {
        if (edges) this.edges = edges;
        else throw Error('HEMesh edges invalid');
    }

    public faceVertices(face:HEFace):Array<HEVertex>
    {
        const verts = new Array<HEVertex>;
        let edge = face.getHalfEdge();
        do 
        { 
            verts.push(edge.getVertex()); 
            edge = edge.getNext(); 
        } while(edge !== face.halfEdge);
        
        return verts;
    }
    public computeNormal(face:HEFace):THREE.Vector3
    {
        const [a, b, c] = this.faceVertices(face);
        const ab = a.getXYZ().clone().sub(b.getXYZ());
        const cb = c.getXYZ().clone().sub(b.getXYZ());
        
        return cb.cross(ab).normalize();
    }

    public getCoplanarGroup(startFace:HEFace, dotThreshold:number = 0.999) 
    {
        const groupNormal = this.computeNormal(startFace);
        const visited = new Set([startFace]);
        const stack = [startFace];

        while(stack.length) 
        {
            const face = stack.pop();
       
            let edge = face?.getHalfEdge();
            do 
            {
                const twin = edge?.getTwin();
                if(twin && twin.getFace())
                {
                    const twinNormal = this.computeNormal(twin.getFace());
                    if(twinNormal && groupNormal)
                    {
                        if (!visited.has(twin.getFace()) && twinNormal.dot(groupNormal) > dotThreshold) 
                        {
                            visited.add(twin.getFace());
                            stack.push(twin.getFace());
                        }
                    }
                    edge = edge?.getNext();
                }
            } while(edge !== face?.getHalfEdge());
        }

        return Array.from(visited);
    }

    public getGroupVertices(faces:Array<HEFace>):Array<HEVertex>
    {
        const set = new Set<HEVertex>();
        faces.forEach((f:HEFace) => this.faceVertices(f).forEach((v:HEVertex) => set.add(v)));

        return Array.from(set);
    }

    public getGroupBoundaryEdges(faces:Array<HEFace>):Array<HEEdge>
    {
        const faceSet = new Set(faces);
        const boundary = new Array<HEEdge>;
        faces.forEach((face:HEFace) => 
        {
            let edge = face.getHalfEdge();
            do 
            {
                if (!edge.getTwin() || !faceSet.has(edge.getTwin().getFace())) 
                    boundary.push(edge);
                edge = edge.getNext();
            } while(edge !== face.halfEdge);
        });
        return boundary;
    }

    public extrudeFaceGroup(faces:Array<HEFace>) 
    {
        const boundaryEdges = this.getGroupBoundaryEdges(faces);
        const groupVerts = this.getGroupVertices(faces);

        const byOrigin = new Map(boundaryEdges.map((e:HEEdge) => [e.getVertex(), e]));
        const loopVerts = new Array<HEVertex>;
        let current:HEEdge | undefined = boundaryEdges[0]; // quick fix 
        const guard = boundaryEdges.length + 1;

        for(let i = 0; i < guard && current; i++) 
        {
            loopVerts.push(current.getVertex());
            current = byOrigin.get(current.getNext().getVertex());
            if (current === boundaryEdges[0])
                break;
        }

        const vertMap = new Map<HEVertex, HEVertex>();
        groupVerts.forEach((v:HEVertex) => 
        {
            const nv = new HEVertex(v.getXYZ().x, v.getXYZ().y, v.getXYZ().z);
            this.vertices.push(nv);
            vertMap.set(v, nv);
        });

        faces.forEach((face:HEFace) => 
        {
            let edge = face.getHalfEdge();
            do 
            {
                const auxEdge = vertMap.get(edge.getVertex())
                if (auxEdge) edge.setVertex(auxEdge);
                else throw new Error('Edge not found in map');

                edge.getVertex().setHalfEdge(edge)
                edge = edge.getNext();
            } while(edge !== face.getHalfEdge());
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



    public fromBufferGeometry(geometry:THREE.BufferGeometry) 
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

            const connectTwin = (edge:HEEdge, fromVert:HEVertex, toVert:HEVertex) => 
            {
                const edgeKey = `${toVert.getXYZ().toArray().join(',')}-${fromVert.getXYZ().toArray().join(',')}`;
                if (edgeMap.has(edgeKey)) 
                {
                    const twinEdge = edgeMap.get(edgeKey);
                    edge.twin = twinEdge;
                    twinEdge.twin = edge;
                    edgeMap.delete(edgeKey); 
                } 
                else 
                {
                    const reverseKey = `${fromVert.getXYZ().toArray().join(',')}-${toVert.getXYZ().toArray().join(',')}`;
                    edgeMap.set(reverseKey, edge);
                }
            };

            connectTwin(he0, v0, v1);
            connectTwin(he1, v1, v2);
            connectTwin(he2, v2, v0);
        }
    }

    public toBufferGeometry() 
    {
        const positions = new Array<number>;
        const indices:Array<number> = [];
        const vertexToIndex = new Map();

        this.vertices.forEach((v:HEVertex, index:number) => 
        {
            positions.push(v.getXYZ().x, v.getXYZ().y, v.getXYZ().z);
            vertexToIndex.set(v, index);
        });
        
        this.faces.forEach((face:HEFace) => 
        {
            let edge = face.getHalfEdge();
            const faceIndices = [];
            
            do 
            {
                faceIndices.push(vertexToIndex.get(edge.getVertex()));
                edge = edge.getNext();
            } while(edge !== face.getHalfEdge());

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

    public recalculateTwins() 
    {
        const edgeMap = new Map();
        this.edges.forEach((e:HEEdge) => e.deleteTwin()); 

        this.edges.forEach((edge:HEEdge) => 
        {
            const fromVert = edge.getVertex();
            const toVert = edge.getNext().getVertex();
            
            const key = `${toVert.getXYZ().x},${toVert.getXYZ().y},${toVert.getXYZ().z}-${fromVert.getXYZ().x},${fromVert.getXYZ().y},${fromVert.getXYZ().z}`;
            
            if (edgeMap.has(key)) 
            {
                const twin = edgeMap.get(key);
                edge.setTwin(twin);
                twin.setTwin(edge);
                edgeMap.delete(key);
            } 
            else 
            {
                const revKey = `${fromVert.getXYZ().x},${fromVert.getXYZ().y},${fromVert.getXYZ().z}-${toVert.getXYZ().x},${toVert.getXYZ().y},${toVert.getXYZ().z}`;
                edgeMap.set(revKey, edge);
            }
        });
    }

    public getUniqueEdges() 
    {
        const seen = new Set<HEEdge>();
        const result: { edge: HEEdge; v0: HEVertex; v1: HEVertex }[] = [];

        this.edges.forEach((edge:HEEdge) => 
        {
            if(seen.has(edge) || (edge.getTwin() && seen.has(edge.getTwin()))) 
                return;

            seen.add(edge);
            result.push({edge, v0: edge.getVertex(), v1: edge.getNext().getVertex()});
        });

        return result;
    }


}