import * as THREE from 'three';

export class SceneManager 
{
    constructor() 
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x242424);
        this.objectsMap = new Map();

        this.initEnvironment();
    }

    initEnvironment() 
    {
        const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222); 
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        
        dirLight.position.set(5, 12, 8);

        this.scene.add(grid, dirLight, ambLight);
    }

    addObject(object) 
    {
        this.scene.add(object);
        this.objectsMap.set(object.uuid, object);

        return object.uuid;
    }

    removeObject(uuid) 
    {
        const object = this.objectsMap.get(uuid);
        if (object) 
        {
            this.scene.remove(object);
            this.objectsMap.delete(uuid);

            if (object.geometry) 
                object.geometry.dispose();

            return true;
        }
        return false;
    }

    getObject(uuid) 
    {
        return this.objectsMap.get(uuid);
    }

    getNativeScene() 
    {
        return this.scene;
    }
}