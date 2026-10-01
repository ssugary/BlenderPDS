import { OpLog } from '../collab/OpLog';
import { DocumentState } from '../collab/DocumentState';
import { compareOpId } from '../collab/OpId';
import { Operation } from '../collab/Operation';

const REFRESH_MS = 500;

/**
 * Lists every operation in the log, sorted by stamp so both players see the same order.
 * The slider replays a prefix of the log into a scratch DocumentState and reports what it contained.
 * It never touches the live state or the scene (a 3D preview of the past is not built yet).
 */
export class TimelinePanel
{
    private root: HTMLDivElement;
    private title: HTMLDivElement;
    private body: HTMLDivElement;
    private slider: HTMLInputElement;
    private summary: HTMLDivElement;
    private list: HTMLDivElement;
    private shownCount = -1;
    private timer: number;

    public constructor(private readonly log: OpLog)
    {
        this.root = document.createElement('div');
        this.root.id = 'timeline';
        this.root.style.cssText = 'position:absolute;left:10px;bottom:10px;z-index:10;width:280px;'
            + 'background:rgba(30,30,30,0.85);color:#fff;border-radius:6px;padding:10px;font-size:12px;';

        this.title = document.createElement('div');
        this.title.style.cssText = 'font-weight:bold;cursor:pointer;';

        this.body = document.createElement('div');
        this.body.style.cssText = 'display:none;margin-top:6px;';

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.min = '0';
        this.slider.style.cssText = 'width:100%;';

        this.summary = document.createElement('div');
        this.summary.style.cssText = 'color:#aaa;margin:4px 0;';

        this.list = document.createElement('div');
        this.list.style.cssText = 'max-height:150px;overflow-y:auto;font-family:monospace;';

        this.body.append(this.slider, this.summary, this.list);
        this.root.append(this.title, this.body);
        document.body.appendChild(this.root);

        this.title.addEventListener('click', () =>
        {
            this.body.style.display = this.body.style.display === 'none' ? 'block' : 'none';
        });
        this.slider.addEventListener('input', () => this.render(true));

        this.render(false);
        this.timer = window.setInterval(() => this.render(false), REFRESH_MS);
    }

    public destroy(): void
    {
        window.clearInterval(this.timer);
        this.root.remove();
    }

    /** `scrubbing` is true when the user moved the slider, false for the periodic refresh. */
    private render(scrubbing: boolean): void
    {
        const ops = [...this.log.all()].sort((a, b) => compareOpId(a.id, b.id));
        const atLatest = Number(this.slider.value) >= this.shownCount;

        if (!scrubbing && ops.length === this.shownCount)
            return;

        this.slider.max = String(ops.length);
        if (!scrubbing && atLatest)
            this.slider.value = String(ops.length);
        this.shownCount = ops.length;

        const step = Number(this.slider.value);
        this.title.textContent = `Timeline (${ops.length} edits)`;

        if (step >= ops.length)
            this.summary.textContent = 'Showing the latest state.';
        else
        {
            const alive = [...DocumentState.replay(ops.slice(0, step)).all()].filter((record) => !record.deleted).length;
            this.summary.textContent = `After ${step} of ${ops.length} edits: ${alive} object(s).`;
        }

        this.list.replaceChildren(...ops.map((op, index) =>
        {
            const row = document.createElement('div');
            row.textContent = `${index + 1}. ${this.describe(op)}`;
            if (index >= step)
                row.style.opacity = '0.4';
            return row;
        }));
        this.list.scrollTop = this.list.scrollHeight;
    }

    private describe(op: Operation): string
    {
        const target = 'objectId' in op ? ` ${op.objectId.slice(0, 6)}` : '';
        return `${op.kind}${target} by ${op.author.slice(0, 4)}`;
    }
}
