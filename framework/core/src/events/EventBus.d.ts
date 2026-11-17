export type ListenerFunction<T = any> = (data: T) => void;
/**
 * Minimal publish/subscribe bus: listeners are keyed by event name, and emit() calls them in
 * registration order. GLOBAL_BUS below is the instance shared by the editor and the React UI.
 */
export declare class EventBus {
    private listeners;
    constructor();
    on(event: string, callback: ListenerFunction): void;
    off(event: string, callback: ListenerFunction): void;
    emit(event: string, data: any): void;
}
export declare const GLOBAL_BUS: EventBus;
//# sourceMappingURL=EventBus.d.ts.map