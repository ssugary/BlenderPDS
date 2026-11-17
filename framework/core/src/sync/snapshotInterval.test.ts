import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SyncEngine } from './SyncEngine';
import { BaseOperation } from '../crdt/Operation';
import { Transport } from '../transport/Transport';
import { canonicalJson } from './snapshot';

class FakeTransport implements Transport
{
    public readonly sent: any[] = [];
    private handlers: Array<(data: any) => void> = [];

    public send(data: any): void { this.sent.push(data); }
    public onMessage(callback: (data: any) => void): void { this.handlers.push(callback); }
    public offMessage(callback: (data: any) => void): void
    {
        this.handlers = this.handlers.filter((handler) => handler !== callback);
    }
    public onClose(): void { /* not needed */ }
    public offClose(): void { /* not needed */ }
    public close(): void { /* not needed */ }

    public deliver(data: any): void
    {
        for (const handler of [...this.handlers])
            handler(data);
    }
}

function replica(state: unknown)
{
    const listeners: Array<(op: BaseOperation) => void> = [];
    return {
        log: {
            versionVector: () => ({ 'site-a': 7 }),
            since: () => []
        },
        onLocalOp: (callback: (op: BaseOperation) => void) => { listeners.push(callback); },
        offLocalOp: () => { /* no-op */ },
        receive: (op: BaseOperation) => { void op; },
        toSnapshot: () => state
    };
}

const state = { schemaVersion: 1, records: [{ id: 'obj-1', fields: { b: { value: 2 }, a: { value: 1 } } }] };

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('snapshot periódico do host', () => {
    it('publica scene_snapshot com checksum canônico e baseSeq confirmado', async () => {
        vi.useFakeTimers();
        const transport = new FakeTransport();
        const engine = new SyncEngine(replica(state), transport, {
            policy: { snapshotIntervalMs: 1_000, validateOperation: (op): op is BaseOperation => true }
        });

        engine.start();
        transport.deliver({ type: 'sync_ack', seq: 42 });

        await vi.advanceTimersByTimeAsync(1_000);
        await vi.advanceTimersByTimeAsync(0);

        const frame = transport.sent.find((message) => message.type === 'scene_snapshot');
        expect(frame).toBeDefined();
        expect(frame.snapshot.baseSeq).toBe(42);
        expect(frame.snapshot.checksum).toBe(
            createHash('sha256').update(canonicalJson(state)).digest('hex')
        );
        expect(frame.snapshot.state).toEqual(state);

        engine.stop();
        const before = transport.sent.length;
        await vi.advanceTimersByTimeAsync(5_000);
        expect(transport.sent.length).toBe(before);
    });

    it('não envia nada quando o intervalo é 0 (convidado)', async () => {
        vi.useFakeTimers();
        const transport = new FakeTransport();
        const engine = new SyncEngine(replica(state), transport, { policy: { snapshotIntervalMs: 0 } });

        engine.start();
        await vi.advanceTimersByTimeAsync(60_000);

        expect(transport.sent.some((message) => message.type === 'scene_snapshot')).toBe(false);
        engine.stop();
    });

    it('canonicaliza chaves em ordem, igual ao SnapshotChecksums do backend', () => {
        expect(canonicalJson({ b: 1, a: [{ d: 2, c: 3 }] })).toBe('{"a":[{"c":3,"d":2}],"b":1}');
    });
});
