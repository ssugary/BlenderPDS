import * as THREE from 'three';

export class SelectionManager 
{
    constructor(sceneManager) 
    {
        this.sceneManager = sceneManager;
        this.selectedObject = null;
        
        this.selectionBox = new THREE.BoxHelper(undefined, 0xffff00);
        this.selectionBox.visible = false;
        this.sceneManager.getNativeScene().add(this.selectionBox);
    }

    selectObject(object) 
    {
        if(this.selectedObject === object) 
            return;

        this.selectedObject = object;
        this.selectionBox.setFromObject(object);
        this.selectionBox.visible = true;
    }

    deselectAll() 
    {
        this.selectedObject = null;
        this.selectionBox.visible = false;
    }

    update()
    {
        if(this.selectedObject)
            this.selectionBox.update();
    }

    getSelected() 
    {
        return this.selectedObject;
    }
}