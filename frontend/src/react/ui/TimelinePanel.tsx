import { useEffect, useMemo, useRef, useState } from 'react';
import { OpLog } from '../../collab/OpLog';
import { DocumentState } from '../../collab/DocumentState';
import { compareOpId } from '../../collab/OpId';
import { Operation } from '../../collab/Operation';

const REFRESH_MS = 500;

const panelStyle = {
    position: 'absolute' as const,
    left: 10,
    bottom: 10,
    zIndex: 10,
    width: 280,
    background: 'rgba(30, 30, 30, 0.85)',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    fontSize: 12
};

interface TimelinePanelProps
{
    log: OpLog;
}

/**
 * Lists every operation in the log, sorted by stamp so both players see the same order.
 * The slider replays a prefix of the log into a scratch DocumentState and reports what it contained.
 * It never touches the live state or the scene (a 3D preview of the past is not built yet).
 *
 * `scrubStep === null` means "follow the latest edit"; dragging back pins the view to a past step,
 * and dragging back to the end resumes following.
 */
export function TimelinePanel({ log }: TimelinePanelProps)
{
    const [open, setOpen] = useState(false);
    const [scrubStep, setScrubStep] = useState<number | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const timer = window.setInterval(() => setRefreshTick((tick) => tick + 1), REFRESH_MS);
        return () => window.clearInterval(timer);
    }, []);

    const ops = useMemo(
        () => [...log.all()].sort((a, b) => compareOpId(a.id, b.id)),
        // The log is append-only and mutable in place, so a tick is what tells us to read it again.
        [log, refreshTick]
    );

    const step = scrubStep === null || scrubStep >= ops.length ? ops.length : scrubStep;

    const summary = step >= ops.length
        ? 'Showing the latest state.'
        : `After ${step} of ${ops.length} edits: ${aliveObjectsAfter(ops, step)} object(s).`;

    useEffect(() =>
    {
        const list = listRef.current;
        if (list)
            list.scrollTop = list.scrollHeight;
    }, [ops]);

    return (
        <div id="timeline" style={panelStyle}>
            <div
                style={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => setOpen((value) => !value)}
            >
                {`Timeline (${ops.length} edits)`}
            </div>

            {open && (
                <div style={{ marginTop: 6 }}>
                    <input
                        type="range"
                        min={0}
                        max={ops.length}
                        value={step}
                        style={{ width: '100%' }}
                        onChange={(event) =>
                        {
                            const next = Number(event.target.value);
                            setScrubStep(next >= ops.length ? null : next);
                        }}
                    />

                    <div style={{ color: '#aaa', margin: '4px 0' }}>{summary}</div>

                    <div ref={listRef} style={{ maxHeight: 150, overflowY: 'auto', fontFamily: 'monospace' }}>
                        {ops.map((op, index) => (
                            <div
                                key={`${op.id.siteId}:${op.id.lamport}`}
                                style={{ opacity: index >= step ? 0.4 : 1 }}
                            >
                                {`${index + 1}. ${describe(op)}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function aliveObjectsAfter(ops: readonly Operation[], step: number): number
{
    return [...DocumentState.replay(ops.slice(0, step)).all()].filter((record) => !record.deleted).length;
}

function describe(op: Operation): string
{
    const target = 'objectId' in op ? ` ${op.objectId.slice(0, 6)}` : '';
    return `${op.kind}${target} by ${op.author.slice(0, 4)}`;
}
