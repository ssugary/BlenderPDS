import { describe, expect, it } from 'vitest';
import { DocumentState } from './DocumentState';
import { Operation, AddObject, ChangeColor, RemoveObject, SetTransform } from './Operation';
import { OpId, opIdKey } from './OpId';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MOVED = [1, 0, 0, 5, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function add(siteId: string, lamport: number, objectId: string, overrides: Partial<AddObject> = {}): Operation {
    return {
        id: { siteId, lamport },
        author: siteId,
        deps: [],
        kind: 'add_object',
        objectId,
        geometry: 'cube',
        transform: IDENTITY,
        color: 0xffffff,
        ...overrides
    };
}

function remove(siteId: string, lamport: number, objectId: string): Operation {
    return { id: { siteId, lamport }, author: siteId, deps: [], kind: 'remove_object', objectId } as RemoveObject;
}

function move(siteId: string, lamport: number, objectId: string, matrix: number[]): Operation {
    return { id: { siteId, lamport }, author: siteId, deps: [], kind: 'set_transform', objectId, matrix } as SetTransform;
}

function paint(siteId: string, lamport: number, objectId: string, color: number): Operation {
    return { id: { siteId, lamport }, author: siteId, deps: [], kind: 'change_color', objectId, color } as ChangeColor;
}

/** Everything the CRDT knows about, sorted by object id so arrival order cannot mask a diff. */
function snapshot(state: DocumentState) {
    const entries: Array<Record<string, unknown>> = [];
    for (const record of state.all()) {
        entries.push({
            id: record.id,
            geometry: record.geometry,
            deleted: record.deleted,
            addStamp: opIdKey(record.addStamp),
            removeStamp: record.removeStamp === null ? null : opIdKey(record.removeStamp),
            transform: record.transform.value,
            transformStamp: opIdKey(record.transform.stamp),
            color: record.color.value,
            colorStamp: opIdKey(record.color.stamp)
        });
    }
    return entries.sort((left, right) => String(left.id).localeCompare(String(right.id)));
}

function permutations<T>(items: readonly T[]): T[][] {
    if (items.length <= 1) {
        return [items.slice()];
    }

    const result: T[][] = [];
    for (let index = 0; index < items.length; index++) {
        const head = items[index];
        const rest = items.slice(0, index).concat(items.slice(index + 1));
        for (const tail of permutations(rest)) {
            result.push([head, ...tail]);
        }
    }
    return result;
}

describe('DocumentState', () => {
    it('creates an object and reports the change', () => {
        const state = new DocumentState();

        expect(state.apply(add('a', 1, 'o1'))).toEqual([{ type: 'added', objectId: 'o1' }]);
        expect(state.get('o1')?.geometry).toBe('cube');
        expect(state.get('o1')?.deleted).toBe(false);
    });

    it('converges whatever the order of the operations that follow their add', () => {
        const heads = [add('a', 1, 'o1'), add('b', 1, 'o2')];
        // Every operation below depends on an object that already exists, which is what the
        // ordered channel guarantees; the order among them is what convergence must not care about.
        const tail = [
            move('a', 2, 'o1', MOVED),
            paint('b', 2, 'o1', 0x00ff00),
            move('c', 3, 'o2', MOVED),
            paint('a', 4, 'o2', 0x0000ff)
        ];

        const expected = snapshot(DocumentState.replay([...heads, ...tail]));
        let compared = 0;

        for (const orderedHeads of permutations(heads)) {
            for (const orderedTail of permutations(tail)) {
                const state = DocumentState.replay([...orderedHeads, ...orderedTail]);
                expect(snapshot(state)).toEqual(expected);
                compared++;
            }
        }

        expect(compared).toBe(48);
        expect(expected).toHaveLength(2);
    });

    it('applying the same operation twice changes nothing (idempotency)', () => {
        const ops = [add('a', 1, 'o1'), move('b', 2, 'o1', MOVED), paint('c', 3, 'o1', 0xff0000)];
        const once = DocumentState.replay(ops);
        const twice = new DocumentState();
        const changes: unknown[] = [];

        for (const op of [...ops, ...ops]) {
            for (const change of twice.apply(op)) {
                changes.push(change);
            }
        }

        // three changes on the first pass, nothing on the second
        expect(changes).toHaveLength(3);
        expect(snapshot(twice)).toEqual(snapshot(once));
    });

    it('a remove is a tombstone: the record stays and hides the object', () => {
        const state = DocumentState.replay([add('a', 1, 'o1')]);

        expect(state.apply(remove('b', 2, 'o1'))).toEqual([{ type: 'removed', objectId: 'o1' }]);
        expect(state.get('o1')).toBeDefined();
        expect(state.get('o1')?.deleted).toBe(true);
        // a second remove of the same object reports nothing new
        expect(state.apply(remove('c', 3, 'o1'))).toEqual([]);
    });

    it('property writes on a deleted object are stored but not reported', () => {
        const state = DocumentState.replay([add('a', 1, 'o1'), remove('b', 2, 'o1')]);

        expect(state.apply(move('c', 3, 'o1', MOVED))).toEqual([]);
        expect(state.get('o1')?.transform.value).toEqual(MOVED);
        expect(state.get('o1')?.deleted).toBe(true);
    });

    it('an add newer than the remove revives the object', () => {
        const state = DocumentState.replay([add('a', 1, 'o1'), remove('b', 3, 'o1')]);

        expect(state.apply(add('c', 4, 'o1', { color: 0x00ff00, transform: MOVED })))
            .toEqual([{ type: 'added', objectId: 'o1' }]);
        expect(state.get('o1')?.deleted).toBe(false);
        expect(state.get('o1')?.transform.value).toEqual(MOVED);
        // Characteristic of today's implementation: the reviving add_object writes transform and
        // addStamp but NOT color (the record is only created once), so the object comes back with
        // the color it had before the delete.
        expect(state.get('o1')?.color.value).toBe(0xffffff);
    });

    it('an add older than the remove does not revive it', () => {
        const state = DocumentState.replay([add('a', 5, 'o1'), remove('b', 6, 'o1')]);

        expect(state.apply(add('c', 1, 'o1'))).toEqual([]);
        expect(state.get('o1')?.deleted).toBe(true);
    });

    it('two adds of the same object keep the newest stamp per field', () => {
        const state = DocumentState.replay([
            add('a', 1, 'o1', { transform: MOVED, color: 0x111111 }),
            add('b', 2, 'o1', { transform: IDENTITY })
        ]);

        expect(state.get('o1')?.transform.value).toEqual(IDENTITY);
        expect(state.get('o1')?.color.value).toBe(0x111111);
        expect(state.get('o1')?.transform.stamp).toEqual({ siteId: 'b', lamport: 2 });
        expect(state.get('o1')?.color.stamp).toEqual({ siteId: 'a', lamport: 1 });
    });

    it('an operation for an object that was never added is dropped', () => {
        const state = new DocumentState();

        // The ordered channel is what makes this safe: an op always arrives after the object it
        // refers to, so the state below is the same on every replica that saw the same channel.
        expect(state.apply(move('a', 1, 'desconhecido', MOVED))).toEqual([]);
        expect(state.get('desconhecido')).toBeUndefined();
    });

    it('replay of a prefix equals applying that prefix one by one', () => {
        const ops = [add('a', 1, 'o1'), move('b', 2, 'o1', MOVED), paint('c', 3, 'o1', 0xff0000)];
        const incremental = new DocumentState();
        for (const op of ops) {
            incremental.apply(op);
        }

        expect(snapshot(DocumentState.replay(ops))).toEqual(snapshot(incremental));
        expect(snapshot(DocumentState.replay(ops.slice(0, 2)))).not.toEqual(snapshot(incremental));
    });

    it('reports a transform whenever the write wins, even with the same matrix', () => {
        const state = DocumentState.replay([add('a', 1, 'o1')]);

        expect(state.apply(move('b', 2, 'o1', MOVED))).toEqual([{ type: 'transform', objectId: 'o1' }]);
        // the register compares STAMPS, not values: a newer stamp wins and is reported
        expect(state.apply(move('c', 3, 'o1', MOVED))).toEqual([{ type: 'transform', objectId: 'o1' }]);
        // an older stamp loses and reports nothing
        expect(state.apply(move('d', 1, 'o1', IDENTITY))).toEqual([]);
        expect(state.get('o1')?.transform.value).toEqual(MOVED);
    });

    it('reports a color whenever the write wins, even with the same colour', () => {
        const state = DocumentState.replay([add('a', 1, 'o1', { color: 0xff0000 })]);

        expect(state.apply(paint('b', 2, 'o1', 0xff0000))).toEqual([{ type: 'color', objectId: 'o1' }]);
        expect(state.apply(paint('c', 3, 'o1', 0x00ff00))).toEqual([{ type: 'color', objectId: 'o1' }]);
        expect(state.apply(paint('d', 1, 'o1', 0x0000ff))).toEqual([]);
        expect(state.get('o1')?.color.value).toBe(0x00ff00);
    });

    it('keeps the ids it was given, whatever the arrival order', () => {
        const stamps: OpId[] = [
            { siteId: 'b', lamport: 2 },
            { siteId: 'a', lamport: 2 }
        ];
        const state = DocumentState.replay([
            add('a', 1, 'o1'),
            move(stamps[0].siteId, stamps[0].lamport, 'o1', MOVED),
            move(stamps[1].siteId, stamps[1].lamport, 'o1', IDENTITY)
        ]);

        // same lamport: the site id decides, so 'b' wins
        expect(state.get('o1')?.transform.value).toEqual(MOVED);
        expect(state.get('o1')?.transform.stamp).toEqual({ siteId: 'b', lamport: 2 });
    });
});
