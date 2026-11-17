import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { ImportedObject, SceneFormat } from '@collab3d/core';

/**
 * OBJ support, in the application's terms.
 *
 * The framework's registry only knows `SceneFormat`; the parser (and the three.js dependency) live
 * here. `ObjImporter` is the editing entry point: it opens a file and puts the meshes in the local
 * scene, as before. This module is the pure part, shared by that importer and by tests.
 */
export const objFormat: SceneFormat = {
    name: 'obj',
    extensions: ['obj'],

    parse(contents: string): ImportedObject[]
    {
        const group = new OBJLoader().parse(contents);
        const imported: ImportedObject[] = [];

        group.updateMatrixWorld(true);
        group.traverse((child) =>
        {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh)
                return;

            let geometry = mesh.geometry;
            if (!geometry.index)
                geometry = BufferGeometryUtils.mergeVertices(geometry);

            mesh.updateMatrix();
            imported.push({
                name: mesh.name || `mesh-${imported.length}`,
                matrix: Array.from(mesh.matrix.elements),
                // Serialized geometry, so the projector can rebuild it without the original file.
                geometry: JSON.stringify(geometry.toJSON())
            });
        });

        return imported;
    }
};
