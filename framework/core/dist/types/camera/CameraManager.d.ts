import { PerspectiveCamera } from 'three';
/**
 * Owns the camera and the navigation strategies (orbit and walk). Switching modes disables the
 * old strategy first, and the transform gizmo can freeze navigation while it is being dragged.
 */
export declare class CameraManager {
    camera: PerspectiveCamera;
    private domElement;
    private strategies;
    private navMode;
    private active;
    constructor(camera: PerspectiveCamera, domElement: HTMLCanvasElement);
    changeMode(): void;
    setMode(mode: string): void;
    setGizmoDragging(isDragging: boolean): void;
    update(delta: number): void;
    /** Both navigation strategies register global listeners, so the viewport must hand them back on unmount. */
    dispose(): void;
}
//# sourceMappingURL=CameraManager.d.ts.map