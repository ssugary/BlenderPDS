import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class RaycasterManager 
{

    private raycaster:THREE.Raycaster;
    private camera:THREE.PerspectiveCamera;
    private sceneManager:SceneManager;
    private pointer:THREE.Vector2;

    constructor(camera:THREE.PerspectiveCamera, sceneManager:SceneManager)
    {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.15;
        this.raycaster.params.Line = {threshold: 0.08};
        this.camera = camera;
        this.sceneManager = sceneManager;
        this.pointer = new THREE.Vector2();
    }

    pick(cords: {x: number;y: number;}) 
    {
        this.pointer.set(cords.x, cords.y);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const objectsToTest = Array.from(this.sceneManager.objectsMap.values());
        const intersects = this.raycaster.intersectObjects(objectsToTest, true);

        if (intersects.length > 0) 
            return intersects[0];
        
        return null;
    }
}