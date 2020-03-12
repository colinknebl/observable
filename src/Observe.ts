export class Observe {
    private static _nextObserverId: number = 0;
    public static getObserverId(this: typeof Observe): number {
        this._nextObserverId += 1;
        return this._nextObserverId;
    }
}