import * as THREE from 'three';
import { Tool } from "../Tool.js";
import { SceneManager } from '../../manager/SceneManager.js';
export class CreateObjectTool extends Tool
{

    constructor(
        private sceneManager:SceneManager
    )
    {
        super();
    }

    public createObject(object:THREE.Object3D):void
    {
        if (object)
            this.sceneManager.addObject(object);
                
    }

    public buildPrimitive(type:string):THREE.Mesh | null
    {
        if (type === 'cube'){
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.y = 0.5;
            return cube;
        }

        if(type === 'cylinder'){
            const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.y = 0.5;
            return cylinder;
        }

        if(type === 'torus'){
            const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const torus = new THREE.Mesh(geometry, material);
            torus.position.y = 0.5;
            return torus;
        }

        if(type === 'sphere'){
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.y = 0.5;
            return sphere;
        }

        if(type === 'pill'){
            const geometry = new THREE.CapsuleGeometry(0.3, 0.8, 16, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const pill = new THREE.Mesh(geometry, material);
            pill.position.y = 0.5;
            return pill;
        }

        return null;
    }
}
