import { Subscribable } from "./Subscribable";
import { Subscription } from './Subscription';
import { Observer, IObserverLike, ObserverCleanupFn } from './Observer'

interface IObservable { }

type ObservableCallbackFn<T> = (observer: Observer<T>) => ObserverCleanupFn;

export class Observable<T> extends Subscribable<T> implements IObservable {

    #observableCallbackFn: ObservableCallbackFn<T>;

    constructor(fn: ObservableCallbackFn<T>) {
        super();
        this.#observableCallbackFn = fn;
    }

    public subscribe(observerLike: IObserverLike<T>): Subscription {
        const observer = this._initObserver(observerLike);
        const cleanupCallbackFn = this.#observableCallbackFn(observer);
        Observer.setCleanupCallback(observer, cleanupCallbackFn);

        return super.subscribe(observerLike, { observer });
    }
}