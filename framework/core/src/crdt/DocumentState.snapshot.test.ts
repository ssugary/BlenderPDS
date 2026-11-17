import { describe, expect, it } from 'vitest';
import { DocumentState } from './DocumentState';
import { OperationKindRegistry } from './OperationKind';
import { BaseOperation } from './Operation';

/**
 * P3.3: a snapshot is a rehydration point only if it carries the stamps and tombstones.
 * These tests take a snapshot, restore it on a fresh replica and check that a late
 * operation still merges exactly as it would have on the original.
 */

type Change = { type: 'write'; id: string };

const registry = (): OperationKindRegistry<Change> => new OperationKindRegistry<Change>([
    {
        kind: 'write',
        validate: (op: unknown): op is BaseOperation =>
            typeof (op as { id?: unknown }).id === 'object',
        apply: (draft, op) =>
        {
            const { objectId, value } = op as BaseOperation & { objectId: string; value: string };
            const existing = draft.get(objectId);
            const record = existing ?? draft.create(objectId, op.id, { objectId });
            const changed = draft.writeField(record, 'value', value, op.id);
            return changed ? [{ type: 'write', id: objectId }] : [];
        }
    } as never
]);

const op = (lamport: number, value: string): BaseOperation & { objectId: string; value: string } => ({
    id: { lamport, siteId: 'site-a' },
    author: 'site-a',
    deps: [],
    kind: 'write',
    objectId: 'obj-1',
    value
});

describe('snapshot do DocumentState', () => {
    it('restaura valores, carimbos e tombstones', () => {
        const original = new DocumentState<Change>(registry());
        original.apply(op(3, 'v3'));
        original.apply(op(5, 'v5'));

        const restored = DocumentState.fromSnapshot(original.toSnapshot(), registry());

        expect(restored.toSnapshot()).toEqual(original.toSnapshot());
        expect(restored.get('obj-1')).toBeDefined();
    });

    it('uma operação antiga não sobrescreve o estado reidratado e uma nova vence', () => {
        const original = new DocumentState<Change>(registry());
        original.apply(op(5, 'v5'));

        const restored = DocumentState.fromSnapshot(original.toSnapshot(), registry());
        restored.apply(op(3, 'velha'));
        expect((restored.get('obj-1')?.fields.get('value')?.value)).toBe('v5');

        restored.apply(op(7, 'nova'));
        expect((restored.get('obj-1')?.fields.get('value')?.value)).toBe('nova');
    });

    it('reidratação e replay completo chegam ao mesmo estado serializado', () => {
        const ops = [op(1, 'a'), op(2, 'b'), op(3, 'c')];
        const full = DocumentState.replay(ops, registry());

        const restored = DocumentState.fromSnapshot(full.toSnapshot(), registry());
        expect(restored.toSnapshot()).toEqual(full.toSnapshot());
    });
});
