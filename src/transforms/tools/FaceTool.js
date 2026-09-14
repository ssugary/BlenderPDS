import * as THREE from 'three';
import { Tool } from './tools/Tool.js';
import { HEMesh } from '../config/HalfEdge.js'; 

export class FaceTool extends Tool 
{
    constructor(transformControls, commandManager, sceneManager) 
    {
        super();
        this.controls = transformControls;
        this.commandManager = commandManager;
        this.sceneManager = sceneManager;
        
        this.highlightMesh = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true, side: THREE.DoubleSide })
        );
        this.highlightMesh.visible = false;
        this.sceneManager.getNativeScene().add(this.highlightMesh);
        
        this.faceCenterHelper = new THREE.Object3D();
        this.sceneManager.getNativeScene().add(this.faceCenterHelper);
        
        this.activeGroup = [];
        this.groupVerts = [];
        this.initialPositions = [];
        this.activeMesh = null;
        this.activeHEMesh = null;

        this.bindControls();
    }

    activate(selectedObject) 
    {
        this.deactivate();
        this.activeMesh = selectedObject;

        if (this.activeMesh) 
        {
            this.activeHEMesh = new HEMesh();
            this.activeHEMesh.fromBufferGeometry(this.activeMesh.geometry);
            this.activeMesh.userData.heMesh = this.activeHEMesh;
        } 
    }

    deactivate()
    {
        this.controls.detach();
        this.highlightMesh.visible = false;
        this.activeMesh = null;
        this.activeHEMesh = null;
        this.activeGroup = [];
        this.groupVerts = [];
    }

    captureState(object) 
    {
        return this.groupVerts.map(v => v.position.clone());
    }

    createCommand(object, before, after) 
    {
        return new FaceMoveCommand(this.activeMesh, this.groupVerts, before, after);
    }

    selectFace(intersect) 
    {
        if (intersect.faceIndex === undefined) 
            return;

        const clickedFace = this.activeHEMesh.faces[intersect.faceIndex];

        if (!clickedFace) 
            return;

        this.activeGroup = this.activeHEMesh.getCoplanarGroup(clickedFace);
        this.groupVerts = this.activeHEMesh.getGroupVertices(this.activeGroup);

        const center = new THREE.Vector3();
        this.groupVerts.forEach(v => center.add(v.position));
        center.divideScalar(this.groupVerts.length);

        this.faceCenterHelper.position.copy(center).applyMatrix4(this.activeMesh.matrixWorld);
        this.controls.attach(this.faceCenterHelper);

        this.updateHighlightGeometry();

        this.highlightMesh.position.copy(this.activeMesh.position);
        this.highlightMesh.rotation.copy(this.activeMesh.rotation);
        this.highlightMesh.scale.copy(this.activeMesh.scale);
        this.highlightMesh.visible = true;
    }

    bindControls() 
    {
        this.controls.addEventListener('change', () => 
        {
            if (!this.activeMesh || this.groupVerts.length === 0) 
                return;
            
            const localPos = this.faceCenterHelper.position.clone();
            this.activeMesh.worldToLocal(localPos);
            
            const center = new THREE.Vector3();
            this.groupVerts.forEach(v => center.add(v.position));
            center.divideScalar(this.groupVerts.length);
            
            const offset = localPos.clone().sub(center);
            this.groupVerts.forEach(v => v.position.add(offset));

            this.activeMesh.geometry.dispose();
            this.activeMesh.geometry = this.activeHEMesh.toBufferGeometry();

            this.updateHighlightGeometry();
        });
    }

    extrudeSelectedFace() 
    {
        if (!this.activeMesh || this.activeGroup.length === 0) 
            return;

        const geo = this.activeMesh.geometry;
        const before = {positions: geo.attributes.position.array.slice(), indices: geo.index.array.slice()};

        this.activeHEMesh.extrudeFaceGroup(this.activeGroup);

        this.groupVerts = this.activeHEMesh.getGroupVertices(this.activeGroup);

        this.activeMesh.geometry.dispose();
        this.activeMesh.geometry = this.activeHEMesh.toBufferGeometry();

        const after = {positions: this.activeMesh.geometry.attributes.position.array.slice(), indices: this.activeMesh.geometry.index.array.slice()};

        this.recenterHelperOnGroup();
        this.updateHighlightGeometry();
        this.highlightMesh.visible = true;
        this.controls.attach(this.faceCenterHelper); 

        const command = new FaceExtrudeCommand(this.activeMesh, before, after, (mesh, data) => this.applyGeometrySnapshot(data));

        this.commandManager.undoStack.push(command);
        this.commandManager.redoStack = [];

    }

    recenterHelperOnGroup() 
    {
        const center = new THREE.Vector3();
        this.groupVerts.forEach(v => center.add(v.position));
        center.divideScalar(this.groupVerts.length);
        this.faceCenterHelper.position.copy(center).applyMatrix4(this.activeMesh.matrixWorld);
    }

    applyGeometrySnapshot(data) 
    {
        this.activeMesh.geometry.dispose();
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
        g.setIndex(Array.from(data.indices));
        g.computeVertexNormals();
        this.activeMesh.geometry = g;

        this.activeHEMesh = new HEMesh();
        this.activeHEMesh.fromBufferGeometry(g);
        this.activeMesh.userData.heMesh = this.activeHEMesh;

        this.activeGroup = [];
        this.groupVerts = [];
        this.highlightMesh.visible = false;
        this.controls.detach();
    }


    updateHighlightGeometry() 
    {
        const positions = [];
        this.activeGroup.forEach(face => 
            this.activeHEMesh.faceVertices(face).forEach(v => 
                positions.push(v.position.x, v.position.y, v.position.z)));

        const attr = this.highlightMesh.geometry.attributes.position;

        if (attr && attr.count === positions.length / 3) 
        {
            attr.array.set(positions);
            attr.needsUpdate = true;
        } 
        else 
            this.highlightMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        

        this.highlightMesh.geometry.computeVertexNormals();
    }
}