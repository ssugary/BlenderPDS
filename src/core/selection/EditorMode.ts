import * as THREE from 'three';
import { SelectionManager } from './SelectionManager';
import { ToolManager } from '../../transforms/ToolManager.js';
import { MeshEditTool } from '../../transforms/tools/MeshEditTool.js';

export class EditorMode 
{
    public enter(_payload?: any): void {}
    public exit(): void {}
    public onCanvasClick(_intersect: THREE.Intersection | null): void {}
}

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
