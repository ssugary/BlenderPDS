import { Tool } from './Tool.js';
import { DeleteObjectCommand } from '../commands/DeleteObjectCommand.js';

export class DeleteTool extends Tool
{
    constructor(sceneManager, commandManager, selectionManager, transformControls)
    {
        super();
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        this.selectionManager = selectionManager;
        this.transformControls = transformControls;
        this.createObjectTool = null;
    }

    setCreateObjectTool(createObjectTool)
    {
        this.createObjectTool = createObjectTool;
    }

    createCommand(selectedObject){
        if (!selectedObject || !this.createObjectTool)
            return;

        this.commandManager.execute(new DeleteObjectCommand(this.createObjectTool, this, selectedObject));
    }

    deleteObject(object)
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
