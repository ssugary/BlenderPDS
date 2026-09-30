import { Transport } from './Transport';

const RTC_CONFIG: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const ICE_GATHER_TIMEOUT_MS = 3000;

export class WebRTCConnection implements Transport
{
    private peer: RTCPeerConnection;
    private channel: RTCDataChannel | null;
    private messageListeners: Array<(data: any) => void>;
    private closeListeners: Array<() => void>;
    private openPromise: Promise<void>;
    private resolveOpen!: () => void;

    public constructor()
    {
        this.peer = new RTCPeerConnection(RTC_CONFIG);
        this.channel = null;
        this.messageListeners = [];
        this.closeListeners = [];
        this.openPromise = new Promise<void>((resolve) => { this.resolveOpen = resolve; });

        this.peer.ondatachannel = (event: RTCDataChannelEvent) => this.bindChannel(event.channel);
        this.peer.onconnectionstatechange = () =>
        {
            const state = this.peer.connectionState;
            if (state === 'failed' || state === 'disconnected' || state === 'closed')
                this.closeListeners.forEach((callback) => callback());
        };
    }

    /** Host side: returns the code the guest must paste. */
    public async createOffer(): Promise<string>
    {
        this.bindChannel(this.peer.createDataChannel('ops'));
        await this.peer.setLocalDescription(await this.peer.createOffer());
        await this.waitForIceGathering();
        return this.encode(this.peer.localDescription!);
    }

    /** Guest side: takes the host's code and returns the answer code to send back. */
    public async acceptOffer(offerCode: string): Promise<string>
    {
        await this.peer.setRemoteDescription(this.decode(offerCode));
        await this.peer.setLocalDescription(await this.peer.createAnswer());
        await this.waitForIceGathering();
        return this.encode(this.peer.localDescription!);
    }

    /** Host side: takes the guest's answer code and finishes the handshake. */
    public async acceptAnswer(answerCode: string): Promise<void>
    {
        await this.peer.setRemoteDescription(this.decode(answerCode));
    }

    public waitUntilOpen(): Promise<void>
    {
        return this.openPromise;
    }

    public send(data: any): void
    {
        if (this.channel?.readyState === 'open')
            this.channel.send(JSON.stringify(data));
    }

    public onMessage(callback: (data: any) => void): void
    {
        this.messageListeners.push(callback);
    }

    public onClose(callback: () => void): void
    {
        this.closeListeners.push(callback);
    }

    public close(): void
    {
        this.channel?.close();
        this.peer.close();
    }

    private bindChannel(channel: RTCDataChannel): void
    {
        this.channel = channel;
        channel.onopen = () => this.resolveOpen();
        channel.onmessage = (event: MessageEvent) =>
        {
            const data = JSON.parse(event.data);
            this.messageListeners.forEach((callback) => callback(data));
        };
        channel.onclose = () => this.closeListeners.forEach((callback) => callback());
    }

    private waitForIceGathering(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            if (this.peer.iceGatheringState === 'complete')
                return resolve();

            const finish = () => { this.peer.removeEventListener('icegatheringstatechange', onChange); resolve(); };
            const onChange = () => { if (this.peer.iceGatheringState === 'complete') finish(); };

            this.peer.addEventListener('icegatheringstatechange', onChange);
            setTimeout(finish, ICE_GATHER_TIMEOUT_MS);
        });
    }

    private encode(description: RTCSessionDescription): string
    {
        return btoa(JSON.stringify({ type: description.type, sdp: description.sdp }));
    }

    private decode(code: string): RTCSessionDescriptionInit
    {
        return JSON.parse(atob(code.trim()));
    }
}
