import { Session } from '../network/Session';

const MAX_MESSAGE_LENGTH = 500;
const ONLINE_COLOR = '#3ddc84';
const OFFLINE_COLOR = '#ff5252';

export class ChatPanel
{
    private session: Session;
    private root: HTMLDivElement;
    private statusDot: HTMLSpanElement;
    private statusText: HTMLSpanElement;
    private messageList: HTMLDivElement;
    private input: HTMLInputElement;
    private sendButton: HTMLButtonElement;

    public constructor(session: Session)
    {
        this.session = session;

        this.root = document.createElement('div');
        this.root.id = 'chat';
        this.root.style.cssText = 'position:absolute;right:10px;bottom:10px;z-index:10;width:280px;display:flex;flex-direction:column;'
            + 'background:rgba(30,30,30,0.85);color:#fff;border-radius:6px;padding:10px;gap:6px;font-size:13px;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:6px;font-weight:bold;';
        this.statusDot = document.createElement('span');
        this.statusDot.style.cssText = 'width:10px;height:10px;border-radius:50%;display:inline-block;';
        this.statusText = document.createElement('span');
        header.append(this.statusDot, this.statusText);

        this.messageList = document.createElement('div');
        this.messageList.style.cssText = 'height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;word-break:break-word;';

        const form = document.createElement('div');
        form.style.cssText = 'display:flex;gap:4px;';
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Message...';
        this.input.maxLength = MAX_MESSAGE_LENGTH;
        this.input.style.cssText = 'flex:1;min-width:0;background:#1a1a1a;color:#fff;border:1px solid #666;padding:4px;';
        this.sendButton = document.createElement('button');
        this.sendButton.textContent = 'Send';
        form.append(this.input, this.sendButton);

        this.root.append(header, this.messageList, form);
        document.body.appendChild(this.root);

        this.setOnline(true);
        this.bindEvents();
    }

    private bindEvents(): void
    {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keydown', (e: KeyboardEvent) =>
        {
            if (e.key === 'Enter')
                this.sendMessage();
        });

        this.session.transport.onMessage((data: any) =>
        {
            if (data?.type === 'chat' && typeof data.text === 'string')
                this.addMessage(this.partnerName(), data.text.slice(0, MAX_MESSAGE_LENGTH));
        });

        this.session.transport.onClose(() =>
        {
            this.setOnline(false);
            this.addSystemMessage(`${this.partnerName()} disconnected.`);
        });
    }

    private sendMessage(): void
    {
        const text = this.input.value.trim();
        if (!text)
            return;

        this.session.transport.send({ type: 'chat', text });
        this.addMessage('You', text);
        this.input.value = '';
    }

    private setOnline(online: boolean): void
    {
        this.statusDot.style.background = online ? ONLINE_COLOR : OFFLINE_COLOR;
        this.statusText.textContent = online ? 'Players online: 2' : 'Players online: 1';
        this.input.disabled = !online;
        this.sendButton.disabled = !online;
    }

    private partnerName(): string
    {
        return this.session.role === 'host' ? 'Guest' : 'Host';
    }

    private addMessage(author: string, text: string): void
    {
        const line = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = `${author}: `;
        line.append(name, document.createTextNode(text));
        this.appendLine(line);
    }

    private addSystemMessage(text: string): void
    {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.cssText = 'color:#aaa;font-style:italic;';
        this.appendLine(line);
    }

    private appendLine(line: HTMLElement): void
    {
        this.messageList.appendChild(line);
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }
}
