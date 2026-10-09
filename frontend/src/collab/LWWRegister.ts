import { OpId, compareOpId } from './OpId';

/**
 * Last-writer-wins register: holds one value and the id of the op that wrote it.
 * set() only takes effect if the new stamp is greater, which makes it commutative:
 * applying the same writes in any order ends in the same value on every replica.
 */
export class LWWRegister<T>
{
    public constructor(public value: T, public stamp: OpId)
    {
    }

    /**
     * Returns true if the value changed (so DocumentState knows to report a change to the projector).
     */
    public set(_value: T, _stamp: OpId): boolean
    {
        if (compareOpId(_stamp, this.stamp) > 0) {
            this.value = _value;
            this.stamp = _stamp;
            return true;  
        }
        return false;      
    }

    /** Exported so the compare used by set() is easy to unit test on its own. */
    public static wins(a: OpId, b: OpId): boolean
    {
        return compareOpId(a, b) > 0;
    }
}
