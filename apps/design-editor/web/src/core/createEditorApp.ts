import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLOBAL_BUS, RaycasterManager, Session, createCollabApp, CollabApp } from '@collab3d/core';
import { ReplicaSession } from '../collab/ReplicaSession';
import { SceneProjector } from '../collab/SceneProjector';
import { PresenceService } from '../collab/PresenceService';
import { RemoteSelectionView } from '../collab/RemoteSelectionView';
import { SelectionManager } from '../manager/SelectionManager';
import { ToolManager } from '../manager/ToolManager';
import { CommandManager } from '../manager/CommandManager';
import { EditorModeManager } from '../manager/EditorModeManager';
import { TransformTool } from '../tool/implementation/TransformTool';
import { CreateObjectTool } from '../tool/implementation/CreateObjectTool';
import { DeleteTool } from '../tool/implementation/DeleteTool';
import { MeshEditTool } from '../tool/implementation/MeshEditTool';
import {
    EdgeSelectionStrategy,
    FaceSelectionStrategy,
    SelectionStrategy,
    VertexSelectionStrategy
} from '../entity/SelectionStrategy';
import { EditMode, ObjectMode } from '../entity/EditorMode';
import { TransformGestureController } from './controllers/TransformGestureController';
import { SelectionController } from './controllers/SelectionController';
import { ActionRouter } from './controllers/ActionRouter';
import { isOperation } from '../collab/validate';

/**
 * The editor's composition root.
 *
 * It used to be the `Engine` class, which assembled the renderer, camera, sync engine and
 * presence channel by hand. That lifecycle now belongs to the framework's `createCollabApp`;
 * this function only declares what is domain-specific: the tools, the controllers, the
 * projection and how an operation is validated on the wire.
 */
export function createEditorApp(container: HTMLElement, replica: ReplicaSession, session: Session | null = null): CollabApp
{
    return createCollabApp({
        container,
        replica,
        session,
        // The app owns the wire rules for its own kinds; the core only applies them.
        syncPolicy: { validateOperation: isOperation },

        mount: ({ host, onFrame }) =>
        {
            const { sceneManager, renderEngine, cameraManager } = host;

            const selectionManager = new SelectionManager(sceneManager);
            const commandManager = new CommandManager();
            const toolManager = new ToolManager();

            const transformControls = new TransformControls(cameraManager.camera, renderEngine.renderer.domElement);
            sceneManager.getNativeScene().add(transformControls);

            const meshEditTool = new MeshEditTool(
                transformControls,
                commandManager,
                sceneManager,
                new FaceSelectionStrategy()
            );
            const editorModeManager = new EditorModeManager(
                new ObjectMode(selectionManager, toolManager),
                new EditMode(meshEditTool)
            );

            const createObjectTool = new CreateObjectTool(sceneManager);
            const deleteTool = new DeleteTool(sceneManager, selectionManager, transformControls);

            // The projection has to exist before the controllers and the network link: both read it.
            const projector = new SceneProjector(replica, sceneManager, selectionManager, createObjectTool);
            projector.onMeshRemoved = (mesh) =>
            {
                if (transformControls.object === mesh)
                    transformControls.detach();
            };

            // Presence and remote selection only exist when the editor was opened inside a session.
            const presence = session ? new PresenceService(replica.clock.id, session.transport) : null;
            const remoteSelection = presence
                ? new RemoteSelectionView(sceneManager.getNativeScene(), presence, projector)
                : null;

            if (remoteSelection)
                onFrame(() => remoteSelection.update());

            toolManager.registerTool('translate', new TransformTool(transformControls, 'translate'));
            toolManager.registerTool('rotate', new TransformTool(transformControls, 'rotate'));
            toolManager.registerTool('scale', new TransformTool(transformControls, 'scale'));

            const editStrategies: Record<string, SelectionStrategy> = {
                vertex: new VertexSelectionStrategy(),
                edge: new EdgeSelectionStrategy(),
                face: new FaceSelectionStrategy()
            };

            const selection = new SelectionController({
                transformControls,
                raycasterManager: new RaycasterManager(cameraManager.camera, sceneManager),
                selectionManager,
                editorModeManager,
                projector,
                replica,
                presence
            });

            const gesture = new TransformGestureController({
                transformControls,
                cameraManager,
                commandManager,
                selectionManager,
                toolManager,
                editorModeManager,
                meshEditTool,
                projector,
                replica
            });

            const actions = new ActionRouter({
                replica,
                commandManager,
                sceneManager,
                selectionManager,
                editorModeManager,
                toolManager,
                meshEditTool,
                createObjectTool,
                deleteTool,
                projector,
                cameraManager,
                selection,
                editStrategies
            });

            gesture.install();
            actions.install();

            // Registered after the controllers so the callback can drop a selection they own.
            presence?.onLockLost(() =>
            {
                selection.dropSelection();
                GLOBAL_BUS.emit('ui:toast', 'The other player selected that object first.');
            });

            return {
                dispose: () =>
                {
                    gesture.dispose();
                    actions.dispose();

                    presence?.stop();
                    transformControls.dispose();
                }
            };
        }
    });
}
