import * as THREE from 'three';
import { FileLoader } from './utils/FileLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class ObjectParser
{
    /**  Parses the type of the object and inserts it into the scene*/
    static parseObject(type, engine)
    {
        if (type === 'cube') 
        {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
            const cube = new THREE.Mesh(geo, mat);
            cube.position.y = 0.5;
            engine.sceneManager.addObject(cube);
        }
        if(type === 'model'){
            FileLoader.getfile().then((contents) => 
            {
                const objLoader = new OBJLoader();
                const group = objLoader.parse(contents);

                group.traverse((child) => 
                {
                    if (child.isMesh) 
                    {
                        if (!child.geometry.index) 
                            child.geometry = BufferGeometryUtils.mergeVertices(child.geometry);
                        
                        child.position.set(0.5, 0.5, 0);
                        
                        child.material = new THREE.MeshStandardMaterial({ color: 0x88ccff });                        
                        engine.sceneManager.addObject(child);
                    }
                })
            }).catch((err) => 
            {
                console.error('Error loading model: ', err);
            });
        }
    }
}