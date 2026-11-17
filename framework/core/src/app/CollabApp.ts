import { EventBus, GLOBAL_BUS } from '../events/EventBus';
import { Session } from '../session/Session';
import { SceneHost } from '../render/SceneHost';
import { SyncEngine } from '../sync/SyncEngine';
import { MessageDefinition, SyncPolicy, SyncReplica } from '../sync/MessageRegistry';

/**
 * What the host application gets to build against: the scene, its replica and the live network
 * link. The application creates its own tools and projector here; the framework never guesses
 * what a domain object is.
 */
export interface CollabAppContext
{
    host: SceneHost;
    replica: SyncReplica;
    session: Session | null;
    syncEngine: SyncEngine | null;
    bus: EventBus;
    /** Runs once per frame, after the camera update and before the render. */
    onFrame(callback: (delta: number) => void): void;
}

/** Everything the application built, so the app can tear it down in the right order. */
export interface CollabAppMount
{
    dispose?(): void;
}

export interface CollabAppConfig
{
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
export class CollabApp
{
    public readonly host: SceneHost;
    public readonly syncEngine: SyncEngine | null;
    public readonly bus: EventBus;

    private mounted: CollabAppMount | void;

    public constructor(config: CollabAppConfig)
    {
        this.bus = config.bus ?? GLOBAL_BUS;
        this.host = new SceneHost(config.container);

        // Sync only exists inside a session: an offline editor has nothing to exchange.
        this.syncEngine = config.session
            ? new SyncEngine(config.replica, config.session.transport, {
                policy: {
                    ...config.syncPolicy,
                    // Only the host may write the snapshot (server-side policy); a guest
                    // sending one would just collect SNAPSHOT_REJECTED.
                    snapshotIntervalMs: config.session.role === 'host'
                        ? config.syncPolicy?.snapshotIntervalMs ?? 30_000
                        : 0
                },
                messages: config.messages
            })
            : null;

        this.syncEngine?.start();

        this.mounted = config.mount({
            host: this.host,
            replica: config.replica,
            session: config.session ?? null,
            syncEngine: this.syncEngine,
            bus: this.bus,
            onFrame: (callback) => this.host.onFrame(callback)
        });
    }

    public start(): void
    {
        this.host.start();
    }

    public stop(): void
    {
        this.host.stop();
    }

    /**
     * Stops the loop, detaches the network link, lets the application release its controllers
     * (in that order: a controller may still read presence while disposing) and finally frees the
     * GL context.
     */
    public dispose(): void
    {
        this.host.stop();
        this.syncEngine?.stop();
        this.mounted?.dispose?.();
        this.host.dispose();
    }
}

export function createCollabApp(config: CollabAppConfig): CollabApp
{
    return new CollabApp(config);
}
