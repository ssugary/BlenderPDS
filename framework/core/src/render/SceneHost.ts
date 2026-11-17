import * as THREE from 'three';
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
export class SceneHost
{
    public readonly sceneManager: SceneManager;
    public readonly renderEngine: RenderEngine;
    public readonly cameraManager: CameraManager;

    private readonly clock = new THREE.Clock();
    private readonly frameCallbacks: FrameCallback[] = [];
    private animationFrameId: number | null = null;

    public constructor(container: HTMLElement)
    {
        this.sceneManager = new SceneManager();
        this.renderEngine = new RenderEngine(this.sceneManager, container);

        this.cameraManager = new CameraManager(
            new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
            this.renderEngine.renderer.domElement
        );

        this.renderEngine.bindEvents(this.cameraManager.camera);
        this.cameraManager.camera.position.set(5, 5, 5);
        this.cameraManager.camera.lookAt(0, 0, 0);
    }

    public onFrame(callback: FrameCallback): void
    {
        this.frameCallbacks.push(callback);
    }

    public start(): void
    {
        if (this.animationFrameId !== null)
            return;

        const loop = (): void =>
        {
            const delta = this.clock.getDelta();

            this.cameraManager.update(delta);
            for (const callback of this.frameCallbacks)
                callback(delta);

            this.renderEngine.render(this.cameraManager.camera);
            this.animationFrameId = requestAnimationFrame(loop);
        };

        loop();
    }

    public stop(): void
    {
        if (this.animationFrameId !== null)
            cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = null;
    }

    /** Stops the loop and releases the navigation listeners and the GL context. */
    public dispose(): void
    {
        this.stop();
        this.cameraManager.dispose();
        this.renderEngine.dispose();
    }
}
