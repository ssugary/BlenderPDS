import { GLOBAL_BUS } from './EventBus';

type KeybindingsConfig = Record<string, string>;

export class InputManager 
{
    private keybindings: KeybindingsConfig;

    public constructor(keybindingsConfig: KeybindingsConfig = {}) 
    {
        this.keybindings = keybindingsConfig;
        
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    public init(): void 
    {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    public destroy(): void 
    {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    private onKeyDown(e: KeyboardEvent): void 
    {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA'].includes(target.tagName)) 
            return;

        if (e.code === 'Tab')
            e.preventDefault();

        const action = this.keybindings[e.code];

        if (action) 
            GLOBAL_BUS.emit('input:action', { action, state: 'down' });
    }

    private onKeyUp(e: KeyboardEvent): void 
    {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA'].includes(target.tagName)) 
            return;

        const action = this.keybindings[e.code];
        
        if (action) 
            GLOBAL_BUS.emit('input:action', { action, state: 'up' });
    }
}
