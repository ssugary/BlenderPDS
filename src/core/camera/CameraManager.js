import { OrbitNavigation, WalkNavigation } from './Navigation.js';

export class CameraManager 
{
    constructor(camera, domElement) 
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

    setMode(mode)
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
    
    setGizmoDragging(isDragging) 
    {
        if (this.navMode === 'orbit') 
            this.strategies.orbit.controls.enabled = !isDragging;
        else 
            this.strategies.walk.enabled = !isDragging;
    }

    update(delta) 
    { 
        this.active.update(delta); 
    }
}