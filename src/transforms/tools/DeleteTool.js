import { Tool } from './Tool.js';

export class DeleteTool extends Tool{

    constructor( sceneManager, commandManager ){
        super()
        this.sceneManager = sceneManager
        this.commandManager = commandManager
    }

    deleteObject(object){
        if (object) 
        {
            this.sceneManager.getNativeScene().remove(object);
            this.sceneManager.objectsMap.delete(object.uuid);

            if (object.geometry) 
                object.geometry.dispose();
            // a mecommandManagersh can have an array of materials
            if (Array.isArray(object.material))
                object.material.forEach(material => material.dispose());
            else if (object.material)
                object.material.dispose();

        }
    }
}