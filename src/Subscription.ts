export type SubsriptionCleanupCallbackFn = () => void;

interface ISubscription {
    // Cancels the subscription
    unsubscribe(): void;

    // A boolean value indicating whether the subscription is closed
    readonly closed: boolean;
}

export class Subscription implements ISubscription {
    #subscriptionCleanupFn: SubsriptionCleanupCallbackFn | undefined;
    #closed: boolean = false;

    constructor(subscriptionCleanupFn: SubsriptionCleanupCallbackFn) {
        this.#subscriptionCleanupFn = subscriptionCleanupFn;
    }

    public get closed(): boolean {
        return this.#closed;
    }

    public unsubscribe(): void {
        if (this.#closed) return;
        this.#subscriptionCleanupFn && this.#subscriptionCleanupFn();
        this.#closed = true;
    }
}