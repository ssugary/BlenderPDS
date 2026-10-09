export interface Transport
{
    send(data: any): void;
    onMessage(callback: (data: any) => void): void;
    /** Mirrors onMessage, so subscribers (React effects) can detach on unmount. */
    offMessage(callback: (data: any) => void): void;
    onClose(callback: () => void): void;
    offClose(callback: () => void): void;
    close(): void;
}
