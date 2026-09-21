import { Object3D } from "three";
import { Tool } from "./tools/Tool";

export class ToolManager 
{
    public activeTool: Tool | null;
    private tools:Map<string, Tool>;
    constructor() 
    {
        this.activeTool = null;
        this.tools = new Map();
    }

    registerTool(name:string, toolInstance:Tool) 
    {
        this.tools.set(name, toolInstance);
    }

    setTool(name:string, selectedObjects:any) 
    {
        const tool = this.tools.get(name);

        if(tool) 
            this.useTool(tool, selectedObjects);
        
    }

    useTool(tool:Tool, selectedObjects:Array<Object3D>) 
    {
        if(this.activeTool && this.activeTool.deactivate) 
            this.activeTool.deactivate();
        
        this.activeTool = tool;
        
        if(this.activeTool && this.activeTool.activate) 
            this.activeTool.activate(selectedObjects);
        
    }
}