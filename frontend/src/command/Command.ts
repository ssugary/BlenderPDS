/**
 * One undoable unit. execute() applies it, undo() reverts it and redo() applies it again;
 * CommandManager owns the history stacks, so a command never has to know about them.
 */
export abstract class Command 
{
    abstract execute():void;
    abstract undo():void;
    abstract redo():void; 
}
