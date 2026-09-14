import * as THREE from 'three';
import { Tool } from './Tool.js';
import { VertexCommand } from './VertexCommand.js';

export class VertexTool extends Tool 
{
    constructor(transformControls, commandManager, sceneManager) 
    {
        super();
        this.controls = transformControls;
        this.commandManager = commandManager;
        this.sceneManager = sceneManager;
        
        this.dummyHelper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this.dummyHelper.visible = false;
        this.sceneManager.getNativeScene().add(this.dummyHelper);
        
        this.activeMesh = null;
        this.activeVertexIndices = [];
        this.bindControls();
    }


    activate(selectedObject) 
    {
        this.deactivate();
        this.controls.setMode('translate');
        this.activeMesh = selectedObject;

        if (this.activeMesh) 
        {
            const geom = this.activeMesh.geometry;
            const mat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.15 });
            this.pointsMesh = new THREE.Points(geom, mat);
            
            this.pointsMesh.position.copy(this.activeMesh.position);
            this.pointsMesh.rotation.copy(this.activeMesh.rotation);
            this.pointsMesh.scale.copy(this.activeMesh.scale);
            
            this.sceneManager.addObject(this.pointsMesh)
        } 
        else 
            this.deactivate();
        
    }

    deactivate()
    {
        this.controls.detach();
        this.dummyHelper.visible = false;

        if (this.pointsMesh) 
        {
            this.sceneManager.removeObject(this.pointsMesh.uuid);
            this.pointsMesh = null;
        }

        this.activeMesh = null;
        this.activeVertexIndices = [];
    }

    captureState(object) 
    {
        return this.dummyHelper.position.clone();
    }

    createCommand(object, before, after) 
    {
        return new VertexCommand(this.activeMesh, this.activeVertexIndices, before, after);
    }

    selectVertex(intersect) 
    {
        if (intersect.index === undefined || intersect.index === null) 
            return;
        
        const posAttribute = this.activeMesh.geometry.attributes.position;
        const vx = posAttribute.getX(intersect.index);
        const vy = posAttribute.getY(intersect.index);
        const vz = posAttribute.getZ(intersect.index);
        
        this.activeVertexIndices = [];
        for (let i = 0; i < posAttribute.count; i++)
            if (Math.abs(posAttribute.getX(i) - vx) < 0.0001 && Math.abs(posAttribute.getY(i) - vy) < 0.0001 && Math.abs(posAttribute.getZ(i) - vz) < 0.0001) 
                this.activeVertexIndices.push(i);
            
        
        
        this.dummyHelper.visible = true;
        this.dummyHelper.position.set(vx, vy, vz);
        this.dummyHelper.position.applyMatrix4(this.activeMesh.matrixWorld);
        this.controls.attach(this.dummyHelper);
    }

    bindControls() 
    {
        this.controls.addEventListener('change', () => 
        {
            if (!this.activeMesh || this.activeVertexIndices.length === 0)
                return;
            
            const localPos = this.dummyHelper.position.clone();
            this.activeMesh.worldToLocal(localPos); 
            
            const positions = this.activeMesh.geometry.attributes.position;

            this.activeVertexIndices.forEach(idx => 
            {
                positions.setXYZ(idx, localPos.x, localPos.y, localPos.z);
            });

            positions.needsUpdate = true;
            this.activeMesh.geometry.computeBoundingSphere();
            this.activeMesh.geometry.computeBoundingBox();
        });
    }
}