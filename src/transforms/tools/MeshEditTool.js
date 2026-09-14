import * as THREE from 'three';
import { Tool } from './Tool.js';
import { HEMesh } from '../../config/HalfEdge.js';
import { MeshEditCommand, FaceExtrudeCommand } from '../commands/MeshEditCommand.js';

export class MeshEditTool extends Tool 
{
    constructor(controls, commandManager, sceneManager, strategy) 
    {
        super();
        this.controls = controls;
        this.commandManager = commandManager;
        this.sceneManager = sceneManager;
        this.strategy = strategy;

        this.activeMesh = null;
        this.activeHEMesh = null;
        this.selectedElements = [];
        this.selectedVertices = [];

        this.pickHelper = null;
        this.highlightObject = null;
        this.gizmoHelper = new THREE.Object3D();
        this.sceneManager.getNativeScene().add(this.gizmoHelper);

        this.rebuildAuxObjects();
        this.bindControls();
    }

    rebuildAuxObjects() 
    {
        if(this.pickHelper) 
            this.sceneManager.removeObject(this.pickHelper.uuid);

        if(this.highlightObject) 
            this.sceneManager.getNativeScene().remove(this.highlightObject);

        this.pickHelper = this.strategy.usesMeshAsPickTarget() ? null : this.strategy.createPickHelper();
        if(this.pickHelper) 
        {
            this.pickHelper.visible = false;
            this.sceneManager.addObject(this.pickHelper);
        }

        this.highlightObject = this.strategy.createHighlightObject();
        this.highlightObject.visible = false;
        this.sceneManager.getNativeScene().add(this.highlightObject);
    }

    setStrategy(strategy) 
    {
        this.clearSelection();
        this.strategy = strategy;
        this.rebuildAuxObjects();

        if(this.activeHEMesh && this.pickHelper) 
        {
            this.strategy.updatePickHelper(this.pickHelper, this.activeHEMesh);
            this.syncHelperTransform(this.pickHelper);
            this.pickHelper.visible = true;
        }
    }

    setTargetMesh(mesh) 
    {
        this.clearSelection();
        this.activeMesh = mesh;

        if(this.activeMesh) 
        {
            this.activeHEMesh = new HEMesh();
            this.activeHEMesh.fromBufferGeometry(this.activeMesh.geometry);
            this.activeMesh.userData.heMesh = this.activeHEMesh;

            if(this.pickHelper) 
            {
                this.strategy.updatePickHelper(this.pickHelper, this.activeHEMesh);
                this.syncHelperTransform(this.pickHelper);
                this.pickHelper.visible = true;
            }
        }
    }

    syncHelperTransform(obj) 
    {
        obj.position.copy(this.activeMesh.position);
        obj.rotation.copy(this.activeMesh.rotation);
        obj.scale.copy(this.activeMesh.scale);
    }

    getPickTarget() 
    {
        return this.strategy.usesMeshAsPickTarget() ? this.activeMesh : this.pickHelper;
    }

    clearSelection() 
    {
        this.controls.detach();

        if(this.highlightObject) 
            this.highlightObject.visible = false;

        this.selectedElements = [];
        this.selectedVertices = [];
    }

    deactivate() 
    {
        this.clearSelection();

        if(this.pickHelper) 
            this.pickHelper.visible = false;

        this.activeMesh = null;
        this.activeHEMesh = null;
    }

    selectAt(intersect) 
    {
        if(!this.activeHEMesh) 
            return;

        const {elements, vertices} = this.strategy.pick(this.activeHEMesh, intersect);

        if(!vertices.length) 
            return;

        this.selectedElements = elements;
        this.selectedVertices = vertices;

        this.recenterGizmo();
        this.updateHighlight();
        this.highlightObject.visible = true;
        this.controls.attach(this.gizmoHelper);
    }

    recenterGizmo() 
    {
        const center = new THREE.Vector3();
        this.selectedVertices.forEach(v => center.add(v.position));
        center.divideScalar(this.selectedVertices.length);
        this.gizmoHelper.position.copy(center).applyMatrix4(this.activeMesh.matrixWorld);
    }

    updateHighlight() 
    {
        this.strategy.updateHighlightObject(this.highlightObject, this.activeHEMesh, this.selectedElements, this.selectedVertices);
        this.syncHelperTransform(this.highlightObject);
    }

    captureState() 
    {
        return this.selectedVertices.map(v => v.position.clone());
    }

    createCommand(object, before, after) 
    {
        return new MeshEditCommand(this, this.activeMesh, this.selectedVertices, before, after);
    }

    bindControls() 
    {
        this.controls.addEventListener('change', () => 
        {
            if(!this.activeMesh || this.selectedVertices.length === 0) 
                return;

            const localPos = this.gizmoHelper.position.clone();
            this.activeMesh.worldToLocal(localPos);

            const center = new THREE.Vector3();
            this.selectedVertices.forEach(v => center.add(v.position));
            center.divideScalar(this.selectedVertices.length);

            const offset = localPos.clone().sub(center);
            this.selectedVertices.forEach(v => v.position.add(offset));

            this.rebuildGeometry();
            this.updateHighlight();

            if(this.pickHelper) 
                this.strategy.updatePickHelper(this.pickHelper, this.activeHEMesh);
        });
    }

    rebuildGeometry() 
    {
        this.activeMesh.geometry.dispose();
        this.activeMesh.geometry = this.activeHEMesh.toBufferGeometry();
    }

    extrudeSelected() 
    {
        if(!this.strategy.supportsExtrude() || !this.activeMesh || this.selectedElements.length === 0) 
            return;

        const geo = this.activeMesh.geometry;
        const before = { positions: geo.attributes.position.array.slice(), indices: geo.index.array.slice() };

        this.activeHEMesh.extrudeFaceGroup(this.selectedElements);
        this.selectedVertices = this.activeHEMesh.getGroupVertices(this.selectedElements);

        this.rebuildGeometry();

        const after = {positions: this.activeMesh.geometry.attributes.position.array.slice(), indices: this.activeMesh.geometry.index.array.slice()};

        this.recenterGizmo();
        this.updateHighlight();
        this.highlightObject.visible = true;
        this.controls.attach(this.gizmoHelper);

        const command = new FaceExtrudeCommand(this.activeMesh, before, after, (mesh, data) => this.applyGeometrySnapshot(data));
        this.commandManager.undoStack.push(command);
        this.commandManager.redoStack = [];
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

        this.clearSelection();
        if(this.pickHelper) 
            this.strategy.updatePickHelper(this.pickHelper, this.activeHEMesh);
    }
}