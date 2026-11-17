/**
 * Subscribes to GLOBAL_BUS for as long as the component stays mounted.
 *
 * The handler is kept in a ref, so a re-render never re-subscribes: the effect only reruns when
 * the event name itself changes. Its cleanup calls EventBus.off, which is what stops listeners
 * from piling up (and why the broken off() only became visible once React arrived).
 */
export declare function useBusEvent<T = any>(event: string, handler: (data: T) => void): void;
//# sourceMappingURL=useBusEvent.d.ts.map