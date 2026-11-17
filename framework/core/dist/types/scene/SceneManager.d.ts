import * as THREE from 'three';
/**
 * Owns the three.js scene and the uuid -> object map. Objects come and go through here, so the
 * tools and SceneProjector always have a lookup by uuid (and, through it, by `userData.objectId`).
 */
export declare class SceneManager {
    private scene;
    objectsMap: Map<string, THREE.Object3D>;
    constructor();
    private initEnvironment;
    addObject(object: THREE.Object3D): string;
    removeObject(uuid: string, dispose?: boolean): boolean;
    private disposeObject;
    getObject(uuid: string): THREE.Object3D | undefined;
    getNativeScene(): THREE.Scene;
}
//# sourceMappingURL=SceneManager.d.ts.map