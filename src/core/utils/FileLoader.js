export class FileLoader
{
    // Prompts a browser window and opens a file
    // returns the text
    async getfile(){
        try 
        {
        const fileHandle = await window.showOpenFilePicker();
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