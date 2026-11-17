import { EventBus } from '../events/EventBus';
import { Session } from '../session/Session';
import { SceneHost } from '../render/SceneHost';
import { SyncEngine } from '../sync/SyncEngine';
import { MessageDefinition, SyncPolicy, SyncReplica } from '../sync/MessageRegistry';
/**
 * What the host application gets to build against: the scene, its replica and the live network
 * link. The application creates its own tools and projector here; the framework never guesses
 * what a domain object is.
 */
export interface CollabAppContext {
    host: SceneHost;
    replica: SyncReplica;
    session: Session | null;
    syncEngine: SyncEngine | null;
    bus: EventBus;
    /** Runs once per frame, after the camera update and before the render. */
    onFrame(callback: (delta: number) => void): void;
}
/** Everything the application built, so the app can tear it down in the right order. */
export interface CollabAppMount {
    dispose?(): void;
}
export interface CollabAppConfig {
    /** Element the canvas is appended to. */
    container: HTMLElement;
    /** The replica this app folds operations into (clock + log + document). */
    replica: SyncReplica;
    /** Null/absent when the editor runs offline; sync and presence then simply do not exist. */
    session?: Session | null;
    bus?: EventBus;
    syncPolicy?: Partial<SyncPolicy>;
    messages?: readonly MessageDefinition[];
    /** Builds the application's controllers, tools and projection. */
    mount(context: CollabAppContext): CollabAppMount | void;
}
/**
 * The composition root of a collaborative 3D application.
 *
 * Before this existed, the editor's `Engine` assembled the renderer, the camera, the sync engine
 * and the presence channel by hand, which meant every application had to copy that wiring. Now the
 * framework owns the lifecycle (host, sync, loop) and asks the application only for `mount`.
 */
export declare class CollabApp {
    readonly host: SceneHost;
    readonly syncEngine: SyncEngine | null;
    readonly bus: EventBus;
    private mounted;
    constructor(config: CollabAppConfig);
    start(): void;
    stop(): void;
    /**
     * Stops the loop, detaches the network link, lets the application release its controllers
     * (in that order: a controller may still read presence while disposing) and finally frees the
     * GL context.
     */
    dispose(): void;
}
export declare function createCollabApp(config: CollabAppConfig): CollabApp;
//# sourceMappingURL=CollabApp.d.ts.map