import * as THREE from 'three';

export class SceneManager 
{
    private scene: THREE.Scene;
    public objectsMap: Map<string, THREE.Object3D>;

    public constructor() 
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x242424);
        this.objectsMap = new Map<string, THREE.Object3D>();

        this.initEnvironment();
    }

    private initEnvironment(): void 
    {
        const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222); 
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        
        dirLight.position.set(5, 12, 8);

        this.scene.add(grid, dirLight, ambLight);
    }

    public addObject(object: THREE.Object3D): string 
    {
        this.scene.add(object);
        this.objectsMap.set(object.uuid, object);

        return object.uuid;
    }

    public removeObject(uuid: string, dispose: boolean = true): boolean 
    {
        const object = this.objectsMap.get(uuid);
        if (object) 
        {
            this.scene.remove(object);
            this.objectsMap.delete(uuid);

            if (dispose)
                this.disposeObject(object);

            return true;
        }
        return false;
    }

    private disposeObject(object: THREE.Object3D): void
    {
        const mesh = object as THREE.Mesh;

        if (mesh.geometry)
            mesh.geometry.dispose();

        if (Array.isArray(mesh.material))
            mesh.material.forEach((material: THREE.Material) => material.dispose());
        else if (mesh.material)
            mesh.material.dispose();
    }

    public getObject(uuid: string): THREE.Object3D | undefined 
    {
        return this.objectsMap.get(uuid);
    }

    public getNativeScene(): THREE.Scene 
    {
        return this.scene;
    }
}
