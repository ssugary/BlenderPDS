import { SceneManager } from '../scene/SceneManager';
import { RenderEngine } from './RenderEngine';
import { CameraManager } from '../camera/CameraManager';
type FrameCallback = (delta: number) => void;
/**
 * Owns the pieces every 3D application needs and nobody wants to rebuild: the scene, the
 * WebGL renderer and the camera with its navigation modes, plus one render loop.
 *
 * Host code adds behaviour with `onFrame`; it never starts its own `requestAnimationFrame`, which
 * is what used to leave two loops running when React remounted the viewport.
 */
export declare class SceneHost {
    readonly sceneManager: SceneManager;
    readonly renderEngine: RenderEngine;
    readonly cameraManager: CameraManager;
    private readonly clock;
    private readonly frameCallbacks;
    private animationFrameId;
    constructor(container: HTMLElement);
    onFrame(callback: FrameCallback): void;
    start(): void;
    stop(): void;
    /** Stops the loop and releases the navigation listeners and the GL context. */
    dispose(): void;
}
export {};
//# sourceMappingURL=SceneHost.d.ts.map