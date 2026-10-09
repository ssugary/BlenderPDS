import { GLOBAL_BUS } from '../core/EventBus';

const DURATION_MS = 2500;

/** Shows short messages that other modules request with GLOBAL_BUS.emit('ui:toast', text). */
export class Toast
{
    private root: HTMLDivElement;
    private timer: number | undefined;

    public constructor()
    {
        this.root = document.createElement('div');
        this.root.id = 'toast';
        this.root.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:20;display:none;'
            + 'background:rgba(30,30,30,0.9);color:#fff;border:1px solid #666;border-radius:6px;padding:8px 14px;font-size:13px;';
        document.body.appendChild(this.root);

        GLOBAL_BUS.on('ui:toast', (text: any) => this.show(String(text)));
    }

    private show(text: string): void
    {
        this.root.textContent = text;
        this.root.style.display = 'block';

        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => { this.root.style.display = 'none'; }, DURATION_MS);
    }
}
