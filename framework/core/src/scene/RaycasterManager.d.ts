import * as THREE from 'three';
import { SceneManager } from './SceneManager';
/** Turns normalized pointer coordinates into the first scene object under the cursor. */
export declare class RaycasterManager {
    private raycaster;
    private camera;
    private sceneManager;
    private pointer;
    constructor(camera: THREE.PerspectiveCamera, sceneManager: SceneManager);
    pick(cords: {
        x: number;
        y: number;
    }): THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null;
}
//# sourceMappingURL=RaycasterManager.d.ts.map