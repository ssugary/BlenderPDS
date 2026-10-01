import { OpId } from './OpId';

export class LamportClock
{
    private counter = 0;

    public constructor(private readonly siteId: string)
    {
    }

    /**
     * Call before creating a local op.
     */
    public tick(): OpId
    {
        this.counter+=1;
        return {lamport: this.counter, siteId:this.siteId};
    }

    /**
     * Call for every remote op received, so the next local op is ordered after it.
     */
    public observe(_remote: OpId): void
    {
        this.counter = Math.max(this.counter, _remote.lamport)
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
