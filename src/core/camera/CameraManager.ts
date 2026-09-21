import { PerspectiveCamera } from 'three';
import { OrbitNavigation, WalkNavigation } from './Navigation.js';

export class CameraManager 
{
    public camera:PerspectiveCamera;
    private domElement:HTMLCanvasElement;
    private strategies:any;
    private navMode:string;
    private active:any;
    constructor(camera:PerspectiveCamera, domElement:HTMLCanvasElement) 
    {
        this.camera = camera;
        this.domElement = domElement;
        this.strategies = {orbit: new OrbitNavigation(this.camera, this.domElement), walk: new WalkNavigation(this.camera, this.domElement)};
        this.navMode = 'orbit';
        this.active = this.strategies.orbit;
        this.active.enable();
    }

    changeMode() 
    {
        this.setMode(this.navMode === 'walk' ? 'orbit' : 'walk');
    }

    setMode(mode:string)
    {
        if (mode === this.navMode) 
            return; 

        this.active.disable();

        if (this.navMode === 'walk' && mode === 'orbit') 
            this.strategies.orbit.syncTarget(); 

        this.navMode = mode;
        this.active = this.strategies[mode];
        this.active.enable();
    }
    
    setGizmoDragging(isDragging:boolean) 
    {
        if (this.navMode === 'orbit') 
            this.strategies.orbit.controls.enabled = !isDragging;
        else 
            this.strategies.walk.enabled = !isDragging;
    }

    update(delta:number) 
    { 
        this.active.update(delta); 
    }
}