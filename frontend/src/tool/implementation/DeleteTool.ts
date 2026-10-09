import { TransformControls } from "three/examples/jsm/Addons.js";
import { SceneManager } from "../../manager/SceneManager";
import { SelectionManager } from "../../manager/SelectionManager";
import { Tool } from "../Tool";
import { Object3D } from "three";


export class DeleteTool extends Tool
{
    private sceneManager:SceneManager;
    private selectionManager:SelectionManager;
    private transformControls:TransformControls;

    constructor(sceneManager:SceneManager, selectionManager:SelectionManager, transformControls:TransformControls)
    {
        super();
        this.sceneManager = sceneManager;
        this.selectionManager = selectionManager;
        this.transformControls = transformControls;
    }

    /** Deletes the object locally (imports). Collaborated objects go through DeleteObjectCommand instead. */
    public deleteObject(object:Object3D):void
    {
        if (!object)
            return;

        if (this.transformControls?.object === object)
            this.transformControls.detach();

        if (this.selectionManager?.getSelected() === object)
            this.selectionManager.deselectAll();

        this.sceneManager.removeObject(object.uuid, false);
    }
}
