import * as THREE from 'three';
import { BufferGeometryLoader } from 'three';

import { FileLoader } from '../core/utils/FileLoader';
import { SceneManager } from '@collab3d/core';
import { sceneFormats } from './index';

/**
 * Loads an OBJ file chosen by the user, through the format the registry registered for `.obj`,
 * and adds each mesh to the local scene. Only the 'model' type is handled today.
 */
export class ObjImporter
{
    /** Parses the type of the object and inserts it into the scene. */
    static parseObject(type: string, sceneManager: SceneManager): void
    {
        if (type !== 'model')
            return;

        const format = sceneFormats.forExtension('obj');
        if (!format)
        {
            console.error('No scene format registered for .obj');
            return;
        }

        FileLoader.getfile().then((contents) =>
        {
            if (!contents)
                return;

            const geometryLoader = new BufferGeometryLoader();

            for (const imported of format.parse(contents))
            {
                const geometry = geometryLoader.parse(JSON.parse(imported.geometry));
                if (!geometry.index)
                    geometry.computeVertexNormals();

                const mesh = new THREE.Mesh(
                    geometry,
                    new THREE.MeshStandardMaterial({ color: 0x88ccff })
                );

                mesh.applyMatrix4(new THREE.Matrix4().fromArray(imported.matrix));
                sceneManager.addObject(mesh);
            }
        }).catch((err) =>
        {
            console.error('Error loading model: ', err);
        });
    }
}
