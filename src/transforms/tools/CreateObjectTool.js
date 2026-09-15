import * as THREE from 'three';
import { Tool } from "./Tool.js";
import { AddObjectCommand } from '../commands/AddObjectCommand.js';

export class CreateObjectTool extends Tool
{
    constructor(sceneManager, commandManager){
        super();
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        this.deleteTool = null;
    }

    setDeleteTool(deleteTool){
        this.deleteTool = deleteTool;
    }

    createCommand(objectType){
        const object = this.buildPrimitive(objectType);
        if (!object || !this.deleteTool)
            return null;

        this.commandManager.execute(new AddObjectCommand(this, this.deleteTool, object));
        return object;
    }

    createObject(object){
        if (!object)
            return;

        this.sceneManager.addObject(object);
    }

    buildPrimitive(type){
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

        return null;
    }
}
