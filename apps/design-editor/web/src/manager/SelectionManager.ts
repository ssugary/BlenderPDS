import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { GLOBAL_BUS } from '../core/EventBus';

/**
 * Holds the single selected mesh and the box drawn around it. Every change is announced on
 * `selection:changed`, which the UI and the selection controller listen to.
 */
export class SelectionManager 
{
    public sceneManager:SceneManager;
    public selectedObject:THREE.Mesh | null;
    public selectionBox:THREE.BoxHelper;
    constructor(sceneManager:SceneManager) 
    {
        this.sceneManager = sceneManager;
        this.selectedObject = null;
        
        this.selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0xffff00);
        this.selectionBox.visible = false;
        this.sceneManager.getNativeScene().add(this.selectionBox);
    }

    selectObject(object:THREE.Mesh):void
    {
        if(this.selectedObject === object) 
            return;

        this.selectedObject = object;
        this.selectionBox.setFromObject(object);
        this.selectionBox.visible = true;
        GLOBAL_BUS.emit('selection:changed', { object });
    }

    deselectAll():void
    {
        this.selectedObject = null;
        this.selectionBox.visible = false;
        GLOBAL_BUS.emit('selection:changed', { object: null });
    }

    update():void
    {
        if(this.selectedObject)
            this.selectionBox.update();
    }

    getSelected():THREE.Mesh | null
    {
        return this.selectedObject;
    }
}