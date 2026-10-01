import { OpLog } from '../collab/OpLog';

/**
 * Stage 3 (after the MVP). Lists OpLog entries and lets you scrub to a past point.
 * TODO: render log.all() as a list/slider. On scrub, DocumentState.replay(ops.slice(0, n))
 * into a scratch state and show that in a read-only preview. Don't touch the live state.
 */
export class TimelinePanel
{
    public constructor(private readonly log: OpLog)
    {
        void this.log;
    }
}
