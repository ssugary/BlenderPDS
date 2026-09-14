import { Engine } from './core/Engine.js';
import { FileLoader } from './core/utils/FileLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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
                const object = objLoader.parse(contents);
                object.position.y = 0.5;
                object.position.x = 0.5;
                engine.sceneManager.addObject(object);
            }).catch((err) => 
            {
                console.error('Error loading model: ', err);
            });
        }
    }
}