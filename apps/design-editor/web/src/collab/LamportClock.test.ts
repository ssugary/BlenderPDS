import { describe, expect, it } from 'vitest';
import { LamportClock } from './LamportClock';

describe('LamportClock', () => {
    it('hands out strictly increasing stamps for local operations', () => {
        const clock = new LamportClock('site-a');

        expect(clock.tick()).toEqual({ lamport: 1, siteId: 'site-a' });
        expect(clock.tick()).toEqual({ lamport: 2, siteId: 'site-a' });
        expect(clock.current).toBe(2);
        expect(clock.id).toBe('site-a');
    });

    it('observing a remote stamp keeps the counter at least as high as it', () => {
        const clock = new LamportClock('site-a');
        clock.tick();

        clock.observe({ lamport: 7, siteId: 'site-b' });

        expect(clock.current).toBe(7);
    });

    it('the next local operation is ordered after the observed one', () => {
        const clock = new LamportClock('site-a');
        clock.observe({ lamport: 7, siteId: 'site-b' });

        expect(clock.tick()).toEqual({ lamport: 8, siteId: 'site-a' });
    });

    it('an older remote stamp never moves the counter back', () => {
        const clock = new LamportClock('site-a');
        clock.tick();
        clock.tick();
        clock.tick();

        clock.observe({ lamport: 1, siteId: 'site-b' });

        expect(clock.current).toBe(3);
        expect(clock.tick().lamport).toBe(4);
    });

    it('two replicas that see each other end up with comparable stamps', () => {
        const alice = new LamportClock('alice');
        const bob = new LamportClock('bob');

        const fromAlice = alice.tick();          // 1@alice
        bob.observe(fromAlice);
        const fromBob = bob.tick();              // 2@bob
        alice.observe(fromBob);

        expect(alice.tick().lamport).toBeGreaterThan(fromBob.lamport);
    });
});
