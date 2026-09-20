
//gambiarra doida pra ListenerFunction receber any
type ListenerFunction<T = any> = (data: T) => void;

export class EventBus 
{
    private listeners: Map<string, Array<ListenerFunction>> ;
    
    public constructor() 
    {
        this.listeners = new Map<string, Array<ListenerFunction>>();
    }

    public on(event:string, callback:ListenerFunction):void
    {

        const callbacks = this.listeners.get(event);

        if(callbacks)
        {
            callbacks.push(callback);
        }
        else
        {
            const newCallbackList = new Array<ListenerFunction>();
            newCallbackList.push(callback)
            this.listeners.set(event, newCallbackList)
            
        }    
    }

    public off(event:string, callback:ListenerFunction):void
    {
        const callbacks = this.listeners.get(event);

        if(callbacks)
        {
            callbacks.filter(cb => cb !== callback);
        }
    }

    public emit(event:string, data:any):void
    {
        const callbacks = this.listeners.get(event);
        if(callbacks)
        {
            callbacks.forEach(callback => callback(data))
        }
    }

}

export const GLOBAL_BUS = new EventBus();