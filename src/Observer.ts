import { Subscription } from './Subscription';

export interface IObserverLike<T> {
    // Receives the next value in the sequence
    next: ObserverNextCallback<T>;

    // Receives the subscription object when `subscribe` is called
    start?: ObserverStartCallback;

    // Receives the sequence error
    error?: ObserverErrorCallback;

    // Receives a completion notification
    complete?: ObserverCompleteCallback;
}

export type ObserverCleanupFn = () => void;
type ObserverNextCallback<T> = (value: T) => void;
type ObserverStartCallback = (subscription: Subscription) => void;
type ObserverErrorCallback = (error: Error) => void;
type ObserverCompleteCallback = () => void;

export class Observer<T> implements IObserverLike<T> {

    public static setCleanupCallback(observer: Observer<any>, cleanupCallbackFn: ObserverCleanupFn) {
        observer.#cleanup = cleanupCallbackFn;
    }

    #next: ObserverNextCallback<T>;
    #start: ObserverStartCallback | undefined;
    #error: ObserverErrorCallback | undefined;
    #complete: ObserverCompleteCallback | undefined;
    #cleanup: ObserverCleanupFn | undefined;
    #active: boolean = true;

    constructor(callbacks: IObserverLike<T>) {
        this.#next = callbacks.next;
        this.#start = callbacks.start;
        this.#error = callbacks.error;
        this.#complete = callbacks.complete;
    }

    public start(subscription: Subscription) {
        this.#start && this.#start(subscription);
    }

    public next(value: T) {
        this.#next(value);
    }

    public error(error: Error | string): void {
        let passedError: Error;
        if (error instanceof Error) {
            passedError = error;
        } else if (typeof error === 'string') {
            passedError = new Error(error);
        } else {
            passedError = new Error('Unknown observable error!');
        }
        this.#error && this.#error(passedError);
    }

    public complete() {
        if (!this.#active) return;
        this.#complete && this.#complete();
        this.#cleanup && this.#cleanup();
        this.#active = false;
    }
}