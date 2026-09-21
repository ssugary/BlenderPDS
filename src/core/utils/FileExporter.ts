import { SceneManager } from '../SceneManager.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import * as THREE from 'three';

export class FileExporter {
    public static exportSceneAsOBJ(sceneManager: SceneManager, filename: string = 'scene.obj'): void {
        const exporter = new OBJExporter();
        const exportRoot = new THREE.Group();
        const exportableObjects: THREE.Mesh[] = [];

        for (const object of sceneManager.objectsMap.values()) {
            if (!object || object.userData?.isEditorHelper) continue;
            
            const mesh = object as THREE.Mesh;
            if (!mesh.isMesh) continue;

            const hasPosition = mesh.geometry
                && mesh.geometry.attributes
                && mesh.geometry.attributes.position;

            if (hasPosition) {
                exportableObjects.push(mesh);
            }
        }
        
        for (const mesh of exportableObjects) {
            const material = Array.isArray(mesh.material)
                ? mesh.material.map((m) => m.clone())
                : mesh.material
                    ? mesh.material.clone()
                    : new THREE.MeshStandardMaterial();

            const clone = new THREE.Mesh(mesh.geometry, material);
            clone.name = mesh.name;
            clone.position.copy(mesh.position);
            clone.rotation.copy(mesh.rotation);
            clone.scale.copy(mesh.scale);
            clone.quaternion.copy(mesh.quaternion);
            clone.userData = {};
            exportRoot.add(clone);
        }

        const result = exporter.parse(exportRoot);

        const blob = new Blob([result], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
