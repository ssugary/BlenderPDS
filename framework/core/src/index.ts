export {
    CORE_VERSION
} from './version';

export type {
    BaseOperation,
    Operation,
    OperationDraft
} from './crdt/Operation';
export type { OpId } from './crdt/OpId';
export { compareOpId, opIdKey } from './crdt/OpId';
export { LamportClock } from './crdt/LamportClock';
export { OpLog } from './crdt/OpLog';
export type { VersionVector } from './crdt/OpLog';
export { LWWRegister } from './crdt/LWWRegister';
export { DocumentState } from './crdt/DocumentState';
export { LwwStrategy, TombstoneSetStrategy } from './crdt/Record';
export type { DocumentRecord, DocumentDraft } from './crdt/Record';
export { OperationKindRegistry } from './crdt/OperationKind';
export type { OperationKindDefinition } from './crdt/OperationKind';

export { EventBus, GLOBAL_BUS } from './events/EventBus';
export type { ListenerFunction } from './events/EventBus';

export type { Transport } from './transport/Transport';
export { WebSocketTransport } from './transport/WebSocketTransport';
export type { Session, SessionRole } from './session/Session';

export * from './api/BackendClient';

export { SceneManager } from './scene/SceneManager';
export { RaycasterManager } from './scene/RaycasterManager';
export { RenderEngine } from './render/RenderEngine';
export { SceneHost } from './render/SceneHost';
export type { Projector } from './render/Projector';
export { CameraManager } from './camera/CameraManager';
export { Navigation, OrbitNavigation, WalkNavigation } from './camera/Navigation';
export { InputManager } from './input/InputManager';

export { PresenceChannel } from './presence/PresenceChannel';
export type { PresenceEntry, PresenceChannelOptions } from './presence/PresenceChannel';

export { MessageRegistry } from './sync/MessageRegistry';
export { SyncEngine } from './sync/SyncEngine';
export { chunkOperations } from './sync/chunking';
export { DEFAULT_SYNC_POLICY } from './sync/MessageRegistry';
export type { MessageDefinition, MessageContext, SyncPolicy, SyncReplica } from './sync/MessageRegistry';

export { SceneFormatRegistry } from './format/SceneFormat';
export type { SceneFormat, ImportedObject } from './format/SceneFormat';

export { CollabApp, createCollabApp } from './app/CollabApp';
export type { CollabAppConfig, CollabAppContext, CollabAppMount } from './app/CollabApp';
