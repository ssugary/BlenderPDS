export class CommandManager
{
    constructor() 
    {
        this.undoStack = [];
        this.redoStack = [];
    }

    execute(command) 
    {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; 
    }

    undo() 
    {
        if(this.undoStack.length === 0) 
            return;

        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
    }

    redo() 
    {
        if(this.redoStack.length === 0) 
            return;

        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
    }
}