import { describe, expect, it } from 'vitest';
import { SyncEngine, Transport } from '@collab3d/core';
import { ReplicaSession } from '../collab/ReplicaSession';
import { isOperation } from '../collab/validate';
import { PresenceService } from '../collab/PresenceService';
import { buildSceneSnapshot } from '../collab/SceneSnapshot';
import { editorKinds } from '../kinds';

/**
 * Two replicas, the real SyncEngine, the real PresenceService and a transport that only moves
 * JSON. This is the closest thing to an end-to-end test that runs without a browser: it proves
 * the protocol converges, not that a WebGL scene draws.
 */

function clone<T>(value: T): T
{
    return JSON.parse(JSON.stringify(value)) as T;
}

class LoopbackTransport implements Transport
{
    public peer: LoopbackTransport | null = null;
    public readonly inbox: unknown[] = [];

    private readonly messageHandlers: Array<(data: any) => void> = [];
    private readonly closeHandlers: Array<() => void> = [];

    public send(data: any): void
    {
        // Queue on the peer so hello/ops exchanges cannot recurse inside send().
        this.peer?.inbox.push(clone(data));
    }

    public onMessage(callback: (data: any) => void): void
    {
        this.messageHandlers.push(callback);
    }

    public offMessage(callback: (data: any) => void): void
    {
        const index = this.messageHandlers.indexOf(callback);
        if (index >= 0)
            this.messageHandlers.splice(index, 1);
    }

    public onClose(callback: () => void): void
    {
        this.closeHandlers.push(callback);
    }

    public offClose(callback: () => void): void
    {
        const index = this.closeHandlers.indexOf(callback);
        if (index >= 0)
            this.closeHandlers.splice(index, 1);
    }

    public close(): void
    {
        this.closeHandlers.forEach((callback) => callback());
    }

    public deliver(): number
    {
        let delivered = 0;
        while (this.inbox.length > 0)
        {
            const message = this.inbox.shift();
            this.messageHandlers.forEach((callback) => callback(message));
            delivered++;
        }
        return delivered;
    }
}

function pair(): [LoopbackTransport, LoopbackTransport]
{
    const left = new LoopbackTransport();
    const right = new LoopbackTransport();
    left.peer = right;
    right.peer = left;
    return [left, right];
}

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MOVED = [1, 0, 0, 5, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function snapshotOf(replica: ReplicaSession): string
{
    return JSON.stringify(buildSceneSnapshot(replica.state, replica.log.versionVector()));
}

/** Drains both inboxes until neither side has anything left to say. */
function settle(t1: LoopbackTransport, t2: LoopbackTransport): void
{
    for (let round = 0; round < 10; round++)
    {
        const delivered = t1.deliver() + t2.deliver();
        if (delivered === 0)
            return;
    }
    throw new Error('the transports never went quiet');
}

function connect(left: ReplicaSession, right: ReplicaSession, l: LoopbackTransport, r: LoopbackTransport): void
{
    const leftEngine = new SyncEngine(left, l, { policy: { validateOperation: isOperation } });
    const rightEngine = new SyncEngine(right, r, { policy: { validateOperation: isOperation } });

    leftEngine.start();
    rightEngine.start();
    settle(l, r);
}

describe('duas réplicas do editor', () => {
    it('convergem ao criar, mover, colorir e excluir', () => {
        const left = new ReplicaSession('site-a');
        const right = new ReplicaSession('site-b');
        const [l, r] = pair();
        connect(left, right, l, r);

        const added = left.commit({
            kind: 'add_object',
            objectId: 'obj-1',
            geometry: 'cube',
            transform: IDENTITY,
            color: 0xffffff
        });
        settle(l, r);

        expect(right.state.get('obj-1')).toBeDefined();
        expect(snapshotOf(left)).toBe(snapshotOf(right));

        left.commit({ kind: 'set_transform', objectId: 'obj-1', matrix: MOVED });
        settle(l, r);
        expect(snapshotOf(left)).toBe(snapshotOf(right));

        right.commit({ kind: 'change_color', objectId: 'obj-1', color: 0x00ff00 });
        settle(l, r);
        expect(snapshotOf(left)).toBe(snapshotOf(right));

        // The remove is stamped after the add on the other site, so it must win on both.
        left.commit({ kind: 'remove_object', objectId: 'obj-1' });
        settle(l, r);

        expect(left.state.get('obj-1')?.deleted).toBe(true);
        expect(right.state.get('obj-1')?.deleted).toBe(true);
        expect(snapshotOf(left)).toBe(snapshotOf(right));
        expect(added.kind).toBe('add_object');
    });

    it('set_mesh converge entre duas réplicas, inclusive com escritas concorrentes', () => {
        const left = new ReplicaSession('site-a');
        const right = new ReplicaSession('site-b');
        const [l, r] = pair();
        connect(left, right, l, r);

        left.commit({ kind: 'add_object', objectId: 'obj-1', geometry: 'cube', transform: IDENTITY, color: 1 });
        settle(l, r);

        const leftMesh = 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3';
        const rightMesh = 'v 0 0 0\nv 0 0 1\nv 0 1 1\nf 1 2 3';

        left.commit({ kind: 'set_mesh', objectId: 'obj-1', geometry: leftMesh });
        right.commit({ kind: 'set_mesh', objectId: 'obj-1', geometry: rightMesh });
        // Simultaneous writes need more than one exchange to reach both sides.
        for (let round = 0; round < 3; round++)
            settle(l, r);

        expect(snapshotOf(left)).toBe(snapshotOf(right));
        // The winning buffer is one of the two, never a merge of them.
        const winner = left.state.get('obj-1')?.fields.get('geometry')?.value;
        expect([leftMesh, rightMesh]).toContain(winner);
    });

    it('kinds que o core não conhece não são aceitos pelo registro do editor', () => {
        const kinds = editorKinds();
        expect(kinds.get('mesh_edit')).toBeUndefined();
        expect(kinds.get('undo')).toBeUndefined();
        expect(kinds.get('set_mesh')).toBeDefined();
    });

    it('a reconexão reenvia só o que falta e não duplica operações', () => {
        const left = new ReplicaSession('site-a');
        const right = new ReplicaSession('site-b');
        const [l, r] = pair();

        left.commit({ kind: 'add_object', objectId: 'offline-1', geometry: 'cube', transform: IDENTITY, color: 1 });
        connect(left, right, l, r);

        expect(right.log.all().length).toBe(left.log.all().length);
        expect(snapshotOf(left)).toBe(snapshotOf(right));

        // A second hello (reconnect) must be harmless: duplicates are dropped by the log.
        connect(left, right, l, r);
        expect(right.log.all().length).toBe(1);
        expect(snapshotOf(left)).toBe(snapshotOf(right));
    });

    it('mensagens de aplicação entram pelo registro, sem switch no motor', () => {
        const left = new ReplicaSession('site-a');
        const right = new ReplicaSession('site-b');
        const [l, r] = pair();

        const chats: string[] = [];
        const chatMessage = {
            type: 'chat_message',
            validate: (payload: any) => typeof payload?.text === 'string',
            handle: (payload: { text: string }) => chats.push(payload.text)
        };

        const leftEngine = new SyncEngine(left, l, {
            policy: { validateOperation: isOperation },
            messages: [chatMessage]
        });
        const rightEngine = new SyncEngine(right, r, {
            policy: { validateOperation: isOperation },
            messages: [chatMessage]
        });

        leftEngine.start();
        rightEngine.start();
        settle(l, r);

        l.send({ type: 'chat_message', text: 'hello from the other side' });
        settle(l, r);

        expect(leftEngine.messages).toContain('sync_hello');
        expect(leftEngine.messages).toContain('chat_message');
        expect(chats).toEqual(['hello from the other side']);
    });

    it('presença: claim remoto bloqueia o clique e a disputa é resolvida pelo siteId', () => {
        const [l, r] = pair();
        const left = new PresenceService('site-a', l);
        const right = new PresenceService('site-b', r);

        expect(left.claim('obj-1')).toBe(true);
        settle(l, r);

        expect(right.lockedBy('obj-1')).toBe('site-a');
        expect(right.claim('obj-1')).toBe(false);

        // A crossed claim: both publish before reading the other side, lower siteId keeps it.
        const lost: string[] = [];
        left.claim('obj-2');
        right.claim('obj-2');
        right.onLockLost((objectId) => lost.push(objectId));
        settle(l, r);

        // 'site-a' wins the crossed claim; 'site-b' let go and was told so.
        expect(left.lockedBy('obj-2')).toBeNull();
        expect(right.lockedBy('obj-2')).toBe('site-a');
        expect(lost).toEqual(['obj-2']);

        left.stop();
        right.stop();
    });
});
