import { Subscribable } from "./Subscribable";
import { Subscription } from './Subscription';
import { Observer, IObserverLike } from './Observer'

interface IObservable { }

type ObservableCallbackFn<T> = (observer: Observer<T>) => () => void;

export class Observable<T> extends Subscribable<T> implements IObservable {

    private _observableCallbackFn: ObservableCallbackFn<T>;

    constructor(fn: ObservableCallbackFn<T>) {
        super();
        this._observableCallbackFn = fn;
    }

    public subscribe(observerLike: IObserverLike<T>): Subscription {
        const observer = this._initObserver(observerLike);
        this._observableCallbackFn(observer);

        return super.subscribe(observerLike, { observer });
    }
}