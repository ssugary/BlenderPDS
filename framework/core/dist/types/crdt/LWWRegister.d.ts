import { OpId } from './OpId';
/**
 * Last-writer-wins register: holds one value and the id of the op that wrote it.
 * set() only takes effect if the new stamp is greater, which makes it commutative:
 * applying the same writes in any order ends in the same value on every replica.
 */
export declare class LWWRegister<T> {
    value: T;
    stamp: OpId;
    constructor(value: T, stamp: OpId);
    /**
     * Returns true if the value changed (so DocumentState knows to report a change to the projector).
     */
    set(_value: T, _stamp: OpId): boolean;
    /** Exported so the compare used by set() is easy to unit test on its own. */
    static wins(a: OpId, b: OpId): boolean;
}
//# sourceMappingURL=LWWRegister.d.ts.map