import * as THREE from 'three';
import { Tool } from './Tool.js';
import { HEMesh, HEVertex } from '../../config/HalfEdge.js';
import { MeshEditCommand, FaceExtrudeCommand } from '../commands/MeshEditCommand.js';
import { TransformControls } from 'three/examples/jsm/Addons.js';
import { CommandManager } from '../CommandManager.js';
import { SceneManager } from '../../core/SceneManager.js';
import { SelectionStrategy } from '../../core/selection/SelectionStrategy.js';

export class MeshEditTool extends Tool 
{
    private controls:TransformControls;
    private commandManager:CommandManager;
    private sceneManager:SceneManager;
    private strategy:SelectionStrategy;

    private activeMesh:THREE.Mesh;
    private activeHEMesh: HEMesh;
    private selectedElements:Array<any> // this might be an Array<HEFace>
    private selectedVertices:Array<HEVertex>

    private active:Boolean;

    private pickHelper:THREE.Object3D | null;
    private highlightObject:THREE.Object3D | null;
    private gizmoHelper:any;

    constructor(controls:TransformControls, commandManager:CommandManager, sceneManager:SceneManager, 
        strategy:SelectionStrategy)
    {
        super();
        this.controls = controls;
        this.commandManager = commandManager;
        this.sceneManager = sceneManager;
        this.strategy = strategy;

        this.activeMesh = new THREE.Mesh;
        this.activeHEMesh = new HEMesh;
        this.selectedElements = [];
        this.selectedVertices = [];

        this.active = false;

        this.pickHelper = null;
        this.highlightObject = null;
        this.gizmoHelper = new THREE.Object3D();
        this.sceneManager.getNativeScene().add(this.gizmoHelper);

        this.rebuildAuxObjects();
        this.bindControls();
    }

    public rebuildAuxObjects():void
    {
        if(this.pickHelper) 
            this.sceneManager.removeObject(this.pickHelper.uuid);

        if(this.highlightObject) 
            this.sceneManager.getNativeScene().remove(this.highlightObject);

        this.pickHelper = this.strategy.usesMeshAsPickTarget() ? null : this.strategy.createPickHelper();
        if(this.pickHelper) 
        {
            this.pickHelper.userData = this.pickHelper.userData || {};
            this.pickHelper.userData.isEditorHelper = true;
            this.pickHelper.visible = false;
            this.sceneManager.addObject(this.pickHelper);
        }

        this.highlightObject = this.strategy.createHighlightObject();
        this.highlightObject.userData = this.highlightObject.userData || {};
        this.highlightObject.userData.isEditorHelper = true;
        this.highlightObject.visible = false;
        this.sceneManager.getNativeScene().add(this.highlightObject);
    }

    public setStrategy(strategy:SelectionStrategy):void 
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

    public setTargetMesh(mesh:THREE.Mesh):void
    {
        this.clearSelection();
        this.activeMesh = mesh;
        this.active = true

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

    public syncHelperTransform(obj:THREE.Object3D):void
    {
        obj.position.copy(this.activeMesh.position);
        obj.rotation.copy(this.activeMesh.rotation);
        obj.scale.copy(this.activeMesh.scale);
    }

    public getPickTarget()
    {
        return this.strategy.usesMeshAsPickTarget() ? this.activeMesh : this.pickHelper;
    }

    public clearSelection() 
    {
        this.controls.detach();

        if(this.highlightObject) 
            this.highlightObject.visible = false;

        this.selectedElements = [];
        this.selectedVertices = [];
    }

    public deactivate() 
    {
        this.clearSelection();

        if(this.pickHelper) 
            this.pickHelper.visible = false;

        this.active = false;
    }

    public selectAt(intersect:any) 
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
        if(this.highlightObject) this.highlightObject.visible = true;
        this.controls.attach(this.gizmoHelper);
    }

    public recenterGizmo() 
    {
        const center = new THREE.Vector3();
        this.selectedVertices.forEach(v => center.add(v.getXYZ()));
        center.divideScalar(this.selectedVertices.length);
        this.gizmoHelper.position.copy(center).applyMatrix4(this.activeMesh.matrixWorld);
    }

    public updateHighlight() 
    {
        if(this.highlightObject)
        {
            this.strategy.updateHighlightObject(this.highlightObject, this.activeHEMesh, this.selectedElements, this.selectedVertices);
            this.syncHelperTransform(this.highlightObject);
        }
    }

    public captureState() 
    {
        return this.selectedVertices.map(v => v.getXYZ().clone());
    }

    public createCommand(object:any, before:any, after:any) 
    {
        return new MeshEditCommand(this, this.activeMesh, this.selectedVertices, before, after);
    }

    public bindControls() 
    {
        this.controls.addEventListener('change', () => 
        {
            if(!this.activeMesh || this.selectedVertices.length === 0) 
                return;

            const localPos = this.gizmoHelper.position.clone();
            this.activeMesh.worldToLocal(localPos);

            const center = new THREE.Vector3();
            this.selectedVertices.forEach(v => center.add(v.getXYZ()));
            center.divideScalar(this.selectedVertices.length);

            const offset = localPos.clone().sub(center);
            this.selectedVertices.forEach(v => v.getXYZ().add(offset));

            this.rebuildGeometry();
            this.updateHighlight();

            if(this.pickHelper) 
                this.strategy.updatePickHelper(this.pickHelper, this.activeHEMesh);
        });
    }

    public rebuildGeometry() 
    {
        this.activeMesh.geometry.dispose();
        this.activeMesh.geometry = this.activeHEMesh.toBufferGeometry();
    }

    public extrudeSelected() 
    {
        if(!this.strategy.supportsExtrude() || !this.activeMesh || this.selectedElements.length === 0) 
            return;

        const geo = this.activeMesh.geometry;
        const before = { positions: geo.attributes.position.array.slice(), indices: geo.index?.array.slice() };

        this.activeHEMesh.extrudeFaceGroup(this.selectedElements);
        this.selectedVertices = this.activeHEMesh.getGroupVertices(this.selectedElements);

        this.rebuildGeometry();

        const after = {positions: this.activeMesh.geometry.attributes.position.array.slice(), indices: this.activeMesh.geometry.index?.array.slice()};

        this.recenterGizmo();
        this.updateHighlight();
        if(this.highlightObject) this.highlightObject.visible = true;
        this.controls.attach(this.gizmoHelper);

        const command = new FaceExtrudeCommand(this.activeMesh, before, after, (mesh:any, data:any) => this.applyGeometrySnapshot(data));
        this.commandManager.undoStack.push(command);
        this.commandManager.redoStack = [];
    }

    public applyGeometrySnapshot(data:any) 
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