export interface Transport
{
    send(data: any): void;
    onMessage(callback: (data: any) => void): void;
    onClose(callback: () => void): void;
    close(): void;
}
