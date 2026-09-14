export class EditorMode 
{
    enter(payload) {}
    exit() {}
    onCanvasClick(intersect) {}
}

export class ObjectMode extends EditorMode 
{
    constructor(selectionManager, toolManager) 
    { 
        super(); 
        this.selectionManager = selectionManager; 
        this.toolManager = toolManager; 
    }

    onCanvasClick(intersect) 
    { 
        const obj = intersect ? intersect.object : null;
        obj ? this.selectionManager.selectObject(obj) : this.selectionManager.deselectAll();

        if(this.toolManager.activeTool)
            this.toolManager.activeTool?.activate(this.selectionManager.getSelected());
    }
}

export class EditMode extends EditorMode 
{
    constructor(meshEditTool) 
    { 
        super(); 
        this.meshEditTool = meshEditTool; 
    }

    enter(targetMesh) 
    { 
        this.meshEditTool.setTargetMesh(targetMesh); 
    }
    exit() 
    { 
        this.meshEditTool.deactivate(); 
    }

    onCanvasClick(intersect) 
    {
        const pickTarget = this.meshEditTool.getPickTarget();

        if (intersect && pickTarget && intersect.object === pickTarget) 
            this.meshEditTool.selectAt(intersect);
    }
}