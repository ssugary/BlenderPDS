export class ToolManager 
{
    constructor() 
    {
        this.activeTool = null;
        this.tools = new Map();
    }

    registerTool(name, toolInstance) 
    {
        this.tools.set(name, toolInstance);
    }

    setTool(name, selectedObjects) 
    {
        const tool = this.tools.get(name);

        if (tool) 
            this.useTool(tool, selectedObjects);
        
    }

    useTool(tool, selectedObjects) 
    {
        if (this.activeTool && this.activeTool.deactivate) 
            this.activeTool.deactivate();
        
        this.activeTool = tool;
        
        if (this.activeTool.activate) 
            this.activeTool.activate(selectedObjects);
        
    }
}