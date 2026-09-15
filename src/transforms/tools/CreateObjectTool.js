import { Tool } from "./Tool";

export class CreateObjectTool extends Tool{

    constructor(sceneManager, commandManager){
        super()
        this.sceneManager = sceneManager
        this.commandManager = commandManager
    }

    CreateObject(object){
        this.sceneManager.getNativeScene.add(object);
        this.sceneManager.objectsMap.set(object.uuid, object);
    }
}