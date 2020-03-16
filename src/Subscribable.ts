import { Observe } from './Observe';

import { IObserverLike, Observer } from './Observer';
import { Subscription } from './Subscription';

export interface ISubscribable<T> {
    subscribe(observerLike: IObserverLike<T>): Subscription;
}

class SubscribedObservers<T> {
    #observer: Observer<T>;
    public id: Symbol;

    constructor(observer: Observer<T>) {
        const id = Observe.getObserverId();
        this.id = Symbol(id);
        this.#observer = observer;
    }

    public next(nextValue: T) {
        this.#observer.next(nextValue);
    }

    public error(error: Error) {
        this.#observer.error(error);
    }

    public complete() {
        this.#observer.complete();
    }
}

type NextCallback<T> = (current: T) => T;

export class Subscribable<T> implements ISubscribable<T> {

    #observers: SubscribedObservers<T>[] = [];
    #currentValue: T | null;

    constructor(initialValue?: T) {
        this.#currentValue = initialValue || null;
    }

    public get value(): T {
        return this.#currentValue as T;
    }

    /**
     * Removes the observer with the passed in ID from this.#observers array
     */
    private _removeSubscriber(id: Symbol) {
        this.#observers = this.#observers.filter(observer => {
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

        this.#observers.push(subscribedObserver);
        const subscription = new Subscription(() => this._removeSubscriber(subscribedObserver.id));

        observer.start(subscription);

        return subscription;
    }

    public next(next: T | NextCallback<T>): void {
        if (typeof next === 'function') {
            this.#currentValue = (next as NextCallback<T>)(this.#currentValue as T);
        } else {
            this.#currentValue = next;
        }
        if (this.#currentValue instanceof Error) {
            return this.#observers.forEach(observer => observer.error(this.#currentValue as unknown as Error));
        }
        return this.#observers.forEach(observer => observer.next(this.#currentValue as T));
    }
}