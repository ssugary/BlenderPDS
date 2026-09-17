import { GLOBAL_BUS } from './EventBus.ts';

export class InputManager 
{
    
    constructor(keybindingsConfig = {}) 
    {
        this.keybindings = keybindingsConfig;
        
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    init() 
    {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    destroy() 
    {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(e) 
    {

        if(['INPUT', 'TEXTAREA'].includes(e.target.tagName)) 
            return;

        if(e.code === 'Tab')
            e.preventDefault();

        const action = this.keybindings[e.code];

        if(action) 
            GLOBAL_BUS.emit('input:action', {action, state: 'down'});
        
    }

    onKeyUp(e) 
    {
        if(['INPUT', 'TEXTAREA'].includes(e.target.tagName)) 
            return;

        const action = this.keybindings[e.code];
        
        if(action) 
            GLOBAL_BUS.emit('input:action', { action, state: 'up' });
        
    }
}