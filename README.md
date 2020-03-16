# observable

## Objects

### Subscribable

An object that can subscribed to. If the value is changed over time all 
observers are notified of the change.

#### Interfaces

```ts
interface ISubscribable<T> {
    subscribe(observerLike: IObserverLike<T>): Subscription;
}

type NextCallback<T> = (current: T) => T;

export class Subscribable<T> implements ISubscribable<T> {
    constructor(initialValue?: T);

    // returns the current subscribable value
    readonly value(): T;

    // subscribe to changes
    public subscribe(observerLike: IObserverLike<T>, options?: { observer: Observer<T> }): Subscription;

    // update the current value of the subscribable and notify observers
    public next(next: T | NextCallback<T>): void;
}
```

#### Usage

##### Inheritance

```ts
export class Count extends Subscribable<number> {
    #current: number = 0;

    constructor(init: number) {
        super(init);
        (window as any).count = this;
    }

    public inc() {
        this.#current += 1;
        this.next(this.#current);
    }

    public dec() {
        this.#current -= 1;
        this.next(this.#current);
    }
}

const count = new Count(0);
count.subscribe({
    next(value) {
        console.log('new count value:', value);
    }
});

// increment
count.inc();
// => new count value: 1

// increment again
count.inc();
// => new count value: 2

// decrement
count.inc();
// => new count value: 1
```

##### Composition

```ts
class Count implements ISubscribable<number> {
    #subscribable: Subscribable<number>;

    constructor(init: number) {
        this.#subscribable = new Subscribable(init);
    }

    public get value(): number {
        return this.#subscribable.value;
    }

    public inc() {
        this.#subscribable.next(c => c + 1);
    }

    public dec() {
        this.#subscribable.next(c => c - 1);
    }

    public subscribe(observerLike: IObserverLike<number>): Subscription {
        return this.#subscribable.subscribe(observerLike);
    }
}

const count = new Count(0);
count.subscribe({
    next(value) {
        console.log('new count value:', value);
    }
});

// increment
count.inc();
// => new count value: 1

// increment again
count.inc();
// => new count value: 2

// decrement
count.inc();
// => new count value: 1
```

### Observable

An object in which the single initialization argument is a callback that 
receives an observer object. The callback passed into the Observerable 
must return a function in which any required cleanup takes place.

#### Interfaces

```ts
interface IObservable { }

type ObservableCallbackFn<T> = (observer: Observer<T>) => ObserverCleanupFn;

export class Observable<T> extends Subscribable<T> implements IObservable {

    constructor(fn: ObservableCallbackFn<T>);

    public subscribe(observerLike: IObserverLike<T>): Subscription;
}
```

#### Usage

```ts
const observable = new Observable<MouseEvent>(observer => {
    const clickHandler = (e: MouseEvent) => {
        observer.next(e);
    }

    window.addEventListener('click', clickHandler, true);

    return () => {
        console.log('unsubscribing...');
        window.removeEventListener('click', clickHandler, true);
    };
});

const subscription = observable.subscribe({
    next(event) {
        console.log('mouse event:', event);
    }
});

// trigger a click
document.body.click();
// => mouse event: <Event Object>

// unsubscribe from window click event
subscription.unsubscribe();
// => unsubscribing...
```

### Subscription

An object that is created when a Subscribable/Observable is subscribed to.

#### Interfaces

```ts
interface ISubscription {
    // Cancels the subscription
    unsubscribe(): void;

    // A boolean value indicating whether the subscription is closed
    readonly closed: boolean;
}

export class Subscription implements ISubscription {

    constructor(subscriptionCleanupFn: SubsriptionCleanupCallbackFn);

    public get closed(): boolean;

    public unsubscribe(): void;
}
```

#### Usage

```ts
const subscription = new Subscribable(/* ... */);
subscription.unsubscribe();

const subscription = new Observable(/* ... */);
subscription.unsubscribe();
```

### Observer

An object that is created when a Subscribable is subscribed to.

#### Interfaces

```ts
export type ObserverCleanupFn = () => void;
type ObserverNextCallback<T> = (value: T) => void;
type ObserverStartCallback = (subscription: Subscription) => void;
type ObserverErrorCallback = (error: Error) => void;
type ObserverCompleteCallback = () => void;

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

export class Observer<T> implements IObserverLike<T> {

    // Add any additional cleanup that needs to happen when the observer.complete method is called
    public static setCleanupCallback(observer: Observer<any>, cleanupCallbackFn: ObserverCleanupFn): void;

    constructor(callbacks: IObserverLike<T>);

    public start(subscription: Subscription): void;

    public next(value: T): void;

    public error(error: Error | string): void;

    public complete(): void;
}
```

#### Usage

```ts
const subscribable = new Subscribable(0);

const subscription = subscribable.subscribe({
    next(value) {
        console.log('next value:', value);
    },
    complete() {
        console.log('complete!');
    },
    error(e: Error) {
        console.error(e.message);
    },
    start(subscription) {
        console.log('subscribed!', subscription);
    }
});

/*
 * Or with the Observer class (there is no benefit to using the Observer class)
 */
const subscription = subscribable.subscribe(new Observer({
    next(value) {
        console.log('next value:', value);
    },
    complete() {
        console.log('complete!');
    },
    error(e: Error) {
        console.error(e.message);
    },
    start(subscription) {
        console.log('subscribed!', subscription);
    }
}));
```