type KeybindingsConfig = Record<string, string>;
/**
 * Maps physical keys to named actions (`action:delete_object`, `tool:translate`...) and emits
 * them on the bus. Keys typed into a form field are ignored.
 */
export declare class InputManager {
    private keybindings;
    constructor(keybindingsConfig?: KeybindingsConfig);
    init(): void;
    destroy(): void;
    private onKeyDown;
    private onKeyUp;
}
export {};
//# sourceMappingURL=InputManager.d.ts.map