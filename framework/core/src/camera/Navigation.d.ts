import * as THREE from 'three';
/** Base navigation strategy. CameraManager keeps one instance per mode and enables only the active one. */
export declare class Navigation {
    enable(): void;
    disable(): void;
    update(_delta: any): void;
    /** Releases whatever global listeners the strategy registered. */
    dispose(): void;
}
/**
 * Orbit around a target (middle-drag rotates, right-drag pans). `syncTarget` re-centres it on
 * the way back from walk mode, so the camera does not jump.
 */
export declare class OrbitNavigation extends Navigation {
    private camera;
    private controls;
    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement);
    enable(): void;
    disable(): void;
    update(_delta: any): void;
    syncTarget(distance?: number): void;
    dispose(): void;
}
/**
 * First-person camera: WASD/space moves and middle-drag looks. Movement arrives as `input:action`
 * events on the bus, and dispose() drops that subscription plus the window listeners.
 */
export declare class WalkNavigation extends Navigation {
    private camera;
    private domElement;
    private enabled;
    private isDragging;
    private rotation;
    private speed;
    private lookSpeed;
    private moveState;
    private onBusAction;
    private onWindowPointerUp;
    private onWindowPointerMove;
    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement);
    enable(): void;
    disable(): void;
    bindEvents(): void;
    dispose(): void;
    update(delta: any): void;
}
//# sourceMappingURL=Navigation.d.ts.map