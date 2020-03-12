import { Subscribable } from './Subscribable';

export type SubsriptionCleanupCallbackFn = () => void;

interface ISubscription {
    // Cancels the subscription
    unsubscribe(): void;

    // A boolean value indicating whether the subscription is closed
    readonly closed: boolean;
}

export class Subscription implements ISubscription {
    private _subscriptionCleanupFn: SubsriptionCleanupCallbackFn;
    private _closed: boolean = false;

    constructor(subscriptionCleanupFn: SubsriptionCleanupCallbackFn) {
        this._subscriptionCleanupFn = subscriptionCleanupFn;
    }

    get closed(): boolean {
        return this._closed;
    }

    unsubscribe() {
        this._subscriptionCleanupFn();
        this._closed = true;
    }
}