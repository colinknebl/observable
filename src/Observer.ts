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

type ObserverNextCallback<T> = (value: T) => void;
type ObserverStartCallback = (subscription: Subscription) => void;
type ObserverErrorCallback = (error: Error) => void;
type ObserverCompleteCallback = () => void;

export class Observer<T> implements IObserverLike<T> {
    private _next: ObserverNextCallback<T>;
    private _start: ObserverStartCallback | undefined;
    private _error: ObserverErrorCallback | undefined;
    private _complete: ObserverCompleteCallback | undefined;

    constructor(callbacks: IObserverLike<T>) {
        this._next = callbacks.next;
        this._start = callbacks.start;
        this._error = callbacks.error;
        this._complete = callbacks.complete;
    }

    public start(subscription: Subscription) {
        this._start && this._start(subscription);
    }

    public next(value: T) {
        this._next(value);
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
        this._error && this._error(passedError);
    }

    public complete() {
        this._complete && this._complete();
    }
}