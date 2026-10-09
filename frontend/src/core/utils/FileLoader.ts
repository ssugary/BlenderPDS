// showOpenFilePicker is part of the File System Access API and not yet in the standard TypeScript DOM lib
declare function showOpenFilePicker(): Promise<FileSystemFileHandle[]>;

export class FileLoader
{
    // Prompts a browser window and opens a file
    // returns the text
    static async getfile(): Promise<string | undefined>
    {
        try 
        {
            const fileHandle = await showOpenFilePicker();
            const file = await fileHandle[0].getFile();
            const contents = await file.text();
            return contents;
        } 
        catch (err) 
        {
            console.error('Could not open file: ', err);
        }
    }
}
