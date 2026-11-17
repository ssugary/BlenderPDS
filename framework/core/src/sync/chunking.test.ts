import { describe, expect, it } from 'vitest';
import { chunkOperations } from './chunking';

interface FakeOp
{
    seq: number;
    padding: string;
}

const bytesOf = (batch: FakeOp[]): number =>
    new TextEncoder().encode(JSON.stringify({ type: 'sync_ops', ops: batch })).length;

function operations(count: number, padding: number): FakeOp[]
{
    return Array.from({ length: count }, (_, index) => ({
        seq: index + 1,
        padding: 'x'.repeat(padding)
    }));
}

describe('chunkOperations', () => {
    it('corta por bytes, não só por contagem', () => {
        const ops = operations(40, 180);

        const frames = chunkOperations(ops, 100, 1_200);

        expect(frames.length).toBeGreaterThan(1);
        for (const frame of frames)
            expect(bytesOf(frame)).toBeLessThanOrEqual(1_200);
        expect(frames.flat().map((op) => op.seq)).toEqual(ops.map((op) => op.seq));
    });

    it('mantém o limite de operações quando elas são pequenas', () => {
        const frames = chunkOperations(operations(25, 10), 10, 7_000);

        expect(frames).toHaveLength(3);
        expect(frames.every((frame) => frame.length <= 10)).toBe(true);
    });

    it('uma única operação maior que o orçamento ainda é enviada sozinha', () => {
        const frames = chunkOperations(operations(1, 2_000), 100, 1_200);

        expect(frames).toHaveLength(1);
        expect(frames[0]).toHaveLength(1);
    });
});
