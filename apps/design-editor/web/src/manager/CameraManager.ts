import { PerspectiveCamera } from 'three';
import { OrbitNavigation, WalkNavigation } from '../entity/Navigation';

/**
 * Owns the camera and the navigation strategies (orbit and walk). Switching modes disables the
 * old strategy first, and the transform gizmo can freeze navigation while it is being dragged.
 */
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

    /** Both navigation strategies register global listeners, so the viewport must hand them back on unmount. */
    dispose():void
    {
        this.active.disable();
        this.strategies.orbit.dispose();
        this.strategies.walk.dispose();
    }
}