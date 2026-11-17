import * as THREE from 'three';
import { SelectionManager } from '../manager/SelectionManager';
import { ToolManager } from '../manager/ToolManager';
import { MeshEditTool } from '../tool/implementation/MeshEditTool';

/**
 * Base editor mode. enter/exit install and remove the mode's tools, and onCanvasClick decides
 * what a click means while the mode is active.
 */
export class EditorMode 
{
    public enter(_payload?: any): void {}
    public exit(): void {}
    public onCanvasClick(_intersect: THREE.Intersection | null): void {}
}

/** Default mode: a click selects the object under the cursor (or clears the selection). */
export class ObjectMode extends EditorMode 
{
    private selectionManager: SelectionManager;
    private toolManager: ToolManager;

    public constructor(selectionManager: SelectionManager, toolManager: ToolManager) 
    { 
        super(); 
        this.selectionManager = selectionManager; 
        this.toolManager = toolManager; 
    }

    public onCanvasClick(intersect: THREE.Intersection | null): void 
    { 
        const obj = intersect ? intersect.object as THREE.Mesh : null;
        obj ? this.selectionManager.selectObject(obj) : this.selectionManager.deselectAll();

        if (this.toolManager.activeTool)
            this.toolManager.activeTool?.activate(this.selectionManager.getSelected());
    }
}

/**
 * Mesh-editing mode: it turns the selected mesh into a half-edge mesh, and clicks pick vertices,
 * edges or faces through the MeshEditTool strategy instead of whole objects.
 */
export class EditMode extends EditorMode 
{
    private meshEditTool: MeshEditTool;

    public constructor(meshEditTool: MeshEditTool) 
    { 
        super(); 
        this.meshEditTool = meshEditTool; 
    }

    public enter(targetMesh: THREE.Mesh): void 
    { 
        this.meshEditTool.setTargetMesh(targetMesh); 
    }

    public exit(): void 
    { 
        this.meshEditTool.deactivate(); 
    }

    public onCanvasClick(intersect: THREE.Intersection | null): void
    {
        const pickTarget = this.meshEditTool.getPickTarget();

        if (intersect && pickTarget && intersect.object === pickTarget) 
            this.meshEditTool.selectAt(intersect);
    }
}
