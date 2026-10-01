import { OpId } from './OpId';

export class LamportClock
{
    private counter = 0;

    public constructor(private readonly siteId: string)
    {
    }

    /**
     * Call before creating a local op.
     * TODO: counter += 1, then return { lamport: counter, siteId }.
     */
    public tick(): OpId
    {
        throw new Error('not implemented');
    }

    /**
     * Call for every remote op received, so the next local op is ordered after it.
     * TODO: counter = Math.max(counter, remote.lamport).
     */
    public observe(_remote: OpId): void
    {
        throw new Error('not implemented');
    }

    public get current(): number
    {
        return this.counter;
    }

    public get id(): string
    {
        return this.siteId;
    }
}
