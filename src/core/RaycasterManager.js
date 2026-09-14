import * as THREE from 'three';

export class RaycasterManager 
{
    constructor(camera, sceneManager)
    {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.15;
        this.camera = camera;
        this.sceneManager = sceneManager;
        this.pointer = new THREE.Vector2();
    }

    pick(coords) 
    {
        this.pointer.set(coords.x, coords.y);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const objectsToTest = Array.from(this.sceneManager.objectsMap.values());
        const intersects = this.raycaster.intersectObjects(objectsToTest, false);

        if (intersects.length > 0) 
            return intersects[0];
        
        return null;
    }
}