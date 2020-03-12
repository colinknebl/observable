import { Observe } from './Observe';

import { IObserverLike, Observer } from './Observer';
import { Subscription } from './Subscription';

interface ISubscribable<T> {
    subscribe(observerLike: IObserverLike<T>): Subscription;
}

class SubscribedObservers<T> {
    private _observer: Observer<T>;
    public id: Symbol;

    constructor(observer: Observer<T>) {
        const id = Observe.getObserverId();
        this.id = Symbol(id);
        this._observer = observer;
    }

    public next(nextValue: T) {
        this._observer.next(nextValue);
    }

    public error(error: Error) {
        this._observer.error(error);
    }

    public complete() {
        this._observer.complete();
    }
}

export class Subscribable<T> implements ISubscribable<T> {

    private _observers: SubscribedObservers<T>[] = [];
    private _currentValue: T | null;

    constructor(initialValue?: T) {
        this._currentValue = initialValue || null;
    }

    /**
     * Removes the observer with the passed in ID from this._observers array
     */
    private _removeSubscriber(id: Symbol) {
        this._observers = this._observers.filter(observer => {
            if (observer.id !== id) {
                return observer;
            }
            observer.complete();
            return null;
        });
    }

    protected _initObserver(observerLike: IObserverLike<T>): Observer<T> {
        let observer: Observer<T>;
        if (!(observerLike instanceof Observer)) {
            observer = new Observer(observerLike);
        } else {
            observer = observerLike;
        }
        return observer;
    }

    /**
     * Subscribes the observer passed in to changes
     */
    public subscribe(observerLike: IObserverLike<T>, options?: { observer: Observer<T> }): Subscription {
        let observer: Observer<T> = options?.observer ?? this._initObserver(observerLike);

        const subscribedObserver = new SubscribedObservers(observer);

        this._observers.push(subscribedObserver);
        const subscription = new Subscription(() => this._removeSubscriber(subscribedObserver.id));

        observer.start(subscription);

        return subscription;
    }

    public next(nextValue: T): void {
        this._currentValue = nextValue;
        if (nextValue instanceof Error) {
            return this._observers.forEach(observer => observer.error(nextValue));
        }
        return this._observers.forEach(observer => observer.next(nextValue));
    }
}