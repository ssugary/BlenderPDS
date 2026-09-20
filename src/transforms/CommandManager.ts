import { Command } from "./commands/Command";

export class CommandManager
{
    private undoStack:Array<Command>;
    private redoStack:Array<Command>
    constructor() 
    {
        this.undoStack = new Array<Command>;
        this.redoStack = new Array<Command>;
    }

    execute(command:Command) 
    {
        if (!command)
            return;

        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; 
    }

    undo() 
    {
        if(this.undoStack.length === 0) 
            return;

        const command = this.undoStack.pop();
        if(command)
        {
            command.undo();
            this.redoStack.push(command);
        }
    }

    redo() 
    {
        if(this.redoStack.length === 0) 
            return;

        const command = this.redoStack.pop();
        if(command)
        {
            command.execute();
            this.undoStack.push(command);
        }
    }

    public clearRedoStack():void
    {
        this.redoStack = new Array<Command>
    }

    public addToUndoStack(command:Command):void
    {
        this.undoStack.push(command)
    }
}