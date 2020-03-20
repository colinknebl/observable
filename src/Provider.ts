declare let window: Window & { Provider: typeof Provider };

export class Provider {
    #objects: Map<Symbol, any> = new Map();
    private static __Instance__: Provider;

    private static _nextObserverId: number = 0;
    public static getObserverId(this: typeof Provider): number {
        this._nextObserverId += 1;
        return this._nextObserverId;
    }

    constructor() {
        if (window.Provider?.__Instance__) {
            return window.Provider.__Instance__;
        } else {
            window.Provider = Provider;
            window.Provider.__Instance__ = this;
        }
    }

    public static set(this: typeof Provider, instance: object): void {
        if (typeof instance === 'function') {
            throw new Error('Did you forget to call new? "instance" must be an instance.')
        }
        const provider = new Provider();
        if (!provider.#objects.has(Symbol.for(instance.constructor.name))) {
            provider.#objects.set(Symbol.for(instance.constructor.name), instance);
        }
    }

    public static of<T>(this: typeof Provider, type: Function | object): T {
        let instance: any;
        if (typeof type === 'object') {
            instance = type;
        } else {
            instance = new (type as any)();
        }
        const instanceSymbol: Symbol = Symbol.for(instance.constructor.name);
        const provider = new Provider();
        if (!provider.#objects.has(instanceSymbol)) {
            provider.#objects.set(instanceSymbol, instance);
        }
        return provider.#objects.get(instanceSymbol);
    }
}
