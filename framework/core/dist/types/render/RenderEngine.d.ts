import * as THREE from 'three';
import { SceneManager } from '../scene/SceneManager';
/**
 * Owns the WebGLRenderer: appends the canvas to the viewport, renders one frame from the camera
 * and keeps it sized to the window. dispose() drops the listener and the GL context.
 */
export declare class RenderEngine {
    private sceneManager;
    private container;
    private resizeHandler;
    renderer: THREE.WebGLRenderer;
    constructor(sceneManager: SceneManager, containerElement: HTMLElement);
    render(camera: THREE.PerspectiveCamera): void;
    bindEvents(camera: THREE.PerspectiveCamera): void;
    /** Drops the resize listener and the WebGL context, so the viewport can be mounted again from scratch. */
    dispose(): void;
    handleResize(camera: THREE.PerspectiveCamera): void;
}
//# sourceMappingURL=RenderEngine.d.ts.map