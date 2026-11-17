import { describe, expect, it } from 'vitest';
import { OpLog } from './OpLog';
import { Operation } from './Operation';

const MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function add(siteId: string, lamport: number, objectId: string): Operation {
    return {
        id: { siteId, lamport },
        author: siteId,
        deps: [],
        kind: 'add_object',
        objectId,
        geometry: 'cube',
        transform: MATRIX,
        color: 0xffffff
    };
}

describe('OpLog', () => {
    it('keeps the insertion order and the version vector of every site', () => {
        const log = new OpLog();

        expect(log.append(add('a', 1, 'o1'))).toBe(true);
        expect(log.append(add('b', 2, 'o2'))).toBe(true);
        expect(log.append(add('a', 3, 'o3'))).toBe(true);

        expect(log.all().map((op) => op.id)).toEqual([
            { siteId: 'a', lamport: 1 },
            { siteId: 'b', lamport: 2 },
            { siteId: 'a', lamport: 3 }
        ]);
        expect(log.versionVector()).toEqual({ a: 3, b: 2 });
    });

    it('drops a repeated operation (idempotent delivery)', () => {
        const log = new OpLog();
        const op = add('a', 1, 'o1');

        expect(log.append(op)).toBe(true);
        expect(log.append(op)).toBe(false);
        expect(log.append({ ...op })).toBe(false);
        expect(log.all()).toHaveLength(1);
        expect(log.has(op.id)).toBe(true);
    });

    it('syncs only what the other side is missing, given its version vector', () => {
        const log = new OpLog();
        log.append(add('a', 1, 'o1'));
        log.append(add('a', 2, 'o2'));
        log.append(add('b', 1, 'o3'));

        expect(log.since({}).map((op) => op.id.lamport)).toEqual([1, 2, 1]);
        expect(log.since({ a: 1 }).map((op) => op.id)).toEqual([
            { siteId: 'a', lamport: 2 },
            { siteId: 'b', lamport: 1 }
        ]);
        expect(log.since({ a: 9, b: 9 })).toEqual([]);
    });

    it('the version vector it hands out is a copy', () => {
        const log = new OpLog();
        log.append(add('a', 4, 'o1'));

        const vector = log.versionVector();
        vector.a = 99;
        delete vector.b;

        expect(log.versionVector()).toEqual({ a: 4 });
    });

    it('the log it hands out is read only for the callers', () => {
        const log = new OpLog();
        log.append(add('a', 1, 'o1'));

        expect(log.all()).toHaveLength(1);
        expect(log.since({})).toHaveLength(1);
        expect(log.all()).toHaveLength(1);
    });
});
