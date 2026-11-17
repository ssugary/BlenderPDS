import { OpId } from './OpId';
/**
 * Logical clock of one replica: every local op gets the next stamp, and observing a remote op
 * keeps the counter at least as high as its stamp, so causal order holds without wall clocks.
 */
export declare class LamportClock {
    private readonly siteId;
    private counter;
    constructor(siteId: string);
    /**
     * Call before creating a local op.
     */
    tick(): OpId;
    /**
     * Call for every remote op received, so the next local op is ordered after it.
     */
    observe(_remote: OpId): void;
    get current(): number;
    get id(): string;
}
//# sourceMappingURL=LamportClock.d.ts.map