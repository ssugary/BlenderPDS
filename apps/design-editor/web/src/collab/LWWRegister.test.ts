import { describe, expect, it } from 'vitest';
import { LWWRegister } from './LWWRegister';
import { compareOpId } from './OpId';

describe('compareOpId', () => {
    it('orders by lamport first and uses the site id as tiebreak', () => {
        expect(compareOpId({ lamport: 1, siteId: 'b' }, { lamport: 2, siteId: 'a' })).toBeLessThan(0);
        expect(compareOpId({ lamport: 2, siteId: 'a' }, { lamport: 2, siteId: 'b' })).toBeLessThan(0);
        expect(compareOpId({ lamport: 2, siteId: 'b' }, { lamport: 2, siteId: 'a' })).toBeGreaterThan(0);
        expect(compareOpId({ lamport: 2, siteId: 'a' }, { lamport: 2, siteId: 'a' })).toBe(0);
    });
});

describe('LWWRegister', () => {
    it('a newer stamp overwrites the value and reports the change', () => {
        const register = new LWWRegister<number>(10, { lamport: 1, siteId: 'a' });

        expect(register.set(20, { lamport: 2, siteId: 'b' })).toBe(true);
        expect(register.value).toBe(20);
        expect(register.stamp).toEqual({ lamport: 2, siteId: 'b' });
    });

    it('an older stamp is ignored', () => {
        const register = new LWWRegister<number>(10, { lamport: 2, siteId: 'a' });

        expect(register.set(99, { lamport: 1, siteId: 'b' })).toBe(false);
        expect(register.value).toBe(10);
        expect(register.stamp).toEqual({ lamport: 2, siteId: 'a' });
    });

    it('the same stamp is not applied twice (idempotency)', () => {
        const stamp = { lamport: 3, siteId: 'a' };
        const register = new LWWRegister<number>(1, stamp);

        expect(register.set(2, stamp)).toBe(false);
        expect(register.value).toBe(1);
    });

    it('concurrent writes on the same lamport converge by site id', () => {
        const fromA = { lamport: 5, siteId: 'a' };
        const fromB = { lamport: 5, siteId: 'b' };

        const first = new LWWRegister<string>('start', { lamport: 0, siteId: 'x' });
        first.set('a', fromA);
        first.set('b', fromB);

        const second = new LWWRegister<string>('start', { lamport: 0, siteId: 'x' });
        second.set('b', fromB);
        second.set('a', fromA);

        expect(first.value).toBe('b');
        expect(second.value).toBe('b');
        expect(first.stamp).toEqual(second.stamp);
    });

    it('wins() mirrors the comparison used by set()', () => {
        expect(LWWRegister.wins({ lamport: 2, siteId: 'a' }, { lamport: 1, siteId: 'z' })).toBe(true);
        expect(LWWRegister.wins({ lamport: 1, siteId: 'z' }, { lamport: 2, siteId: 'a' })).toBe(false);
        expect(LWWRegister.wins({ lamport: 2, siteId: 'a' }, { lamport: 2, siteId: 'a' })).toBe(false);
    });
});
