import { EventBus, GLOBAL_BUS, ListenerFunction } from './EventBus';

/**
 * Keeps the bus listeners a component installed so dispose() can remove exactly those.
 * Without it, the second mount React's StrictMode does in development would leave a
 * duplicate set of handlers reacting to every bus event.
 */
export class BusSubscriptions
{
    private readonly installed:Array<{ event:string, callback:ListenerFunction }>;

    public constructor(private readonly bus:EventBus = GLOBAL_BUS)
    {
        this.installed = [];
    }

    public on(event:string, callback:ListenerFunction):void
    {
        this.bus.on(event, callback);
        this.installed.push({ event, callback });
    }

    public dispose():void
    {
        for (const { event, callback } of this.installed)
            this.bus.off(event, callback);

        this.installed.length = 0;
    }
}
