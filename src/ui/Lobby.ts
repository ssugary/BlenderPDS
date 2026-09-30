import { WebRTCConnection } from '../network/WebRTCConnection';
import { Session } from '../network/Session';

export class Lobby
{
    private root: HTMLDivElement;
    private panel: HTMLDivElement;
    private resolve!: (session: Session | null) => void;

    public constructor()
    {
        this.root = document.createElement('div');
        this.root.id = 'lobby';
        this.root.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#242424;color:#fff;';

        this.panel = document.createElement('div');
        this.panel.style.cssText = 'width:min(520px,90vw);display:flex;flex-direction:column;gap:10px;';
        this.root.appendChild(this.panel);
        document.body.appendChild(this.root);
    }

    /** Resolves with a connected session, or null when the user chooses to work offline. */
    public run(): Promise<Session | null>
    {
        return new Promise<Session | null>((resolve) =>
        {
            this.resolve = resolve;
            this.showMenu();
        });
    }

    private finish(session: Session | null): void
    {
        this.root.remove();
        this.resolve(session);
    }

    private showMenu(): void
    {
        this.reset('BlenderPDS');
        this.addText('Collaborative 3D modeling. Host a session or join one.');
        this.addButton('Host a session', () => this.startHost());
        this.addButton('Join a session', () => this.startGuest());
        this.addButton('Work offline', () => this.finish(null));
    }

    private async startHost(): Promise<void>
    {
        this.reset('Hosting');
        const status = this.addText('Creating invite code...');
        const connection = new WebRTCConnection();

        try
        {
            const offerCode = await connection.createOffer();
            status.textContent = '1. Send this invite code to your partner:';
            this.addCodeBox(offerCode, true);

            this.addText('2. Paste their answer code here:');
            const answerBox = this.addCodeBox('', false);
            const errorLine = this.addText('');

            this.addButton('Connect', async () =>
            {
                try
                {
                    errorLine.textContent = 'Connecting...';
                    await connection.acceptAnswer(answerBox.value);
                }
                catch
                {
                    errorLine.textContent = 'That answer code is not valid.';
                }
            });

            await connection.waitUntilOpen();
            this.finish({ role: 'host', transport: connection });
        }
        catch
        {
            status.textContent = 'Could not create the invite code.';
        }
    }

    private startGuest(): void
    {
        this.reset('Joining');
        this.addText('1. Paste the host\'s invite code:');
        const offerBox = this.addCodeBox('', false);
        const errorLine = this.addText('');
        const connection = new WebRTCConnection();

        this.addButton('Create answer code', async () =>
        {
            try
            {
                errorLine.textContent = 'Creating answer code...';
                const answerCode = await connection.acceptOffer(offerBox.value);

                this.reset('Joining');
                this.addText('2. Send this answer code back to the host:');
                this.addCodeBox(answerCode, true);
                this.addText('Waiting for the host to connect...');

                await connection.waitUntilOpen();
                this.finish({ role: 'guest', transport: connection });
            }
            catch
            {
                errorLine.textContent = 'That invite code is not valid.';
            }
        });
    }

    private reset(title: string): void
    {
        this.panel.replaceChildren();
        const heading = document.createElement('h2');
        heading.textContent = title;
        heading.style.margin = '0';
        this.panel.appendChild(heading);
    }

    private addText(text: string): HTMLParagraphElement
    {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.style.margin = '0';
        this.panel.appendChild(paragraph);
        return paragraph;
    }

    private addCodeBox(value: string, readOnly: boolean): HTMLTextAreaElement
    {
        const box = document.createElement('textarea');
        box.value = value;
        box.readOnly = readOnly;
        box.rows = 5;
        box.style.cssText = 'width:100%;box-sizing:border-box;background:#1a1a1a;color:#fff;border:1px solid #666;font-family:monospace;font-size:11px;';
        this.panel.appendChild(box);

        if (readOnly)
        {
            box.addEventListener('focus', () => box.select());
            this.addButton('Copy', () => navigator.clipboard?.writeText(box.value));
        }

        return box;
    }

    private addButton(label: string, onClick: () => void): HTMLButtonElement
    {
        const button = document.createElement('button');
        button.textContent = label;
        button.addEventListener('click', onClick);
        this.panel.appendChild(button);
        return button;
    }
}
