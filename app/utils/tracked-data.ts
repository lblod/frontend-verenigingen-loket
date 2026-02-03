import { tracked } from '@glimmer/tracking';
// TODO; use `@ember/reactive/collections` once we update to Ember v6.8+
import { TrackedObject, TrackedArray } from 'tracked-built-ins';

/**
 * A class that behaves similar to EmberData's Model class, but in a more generic way.
 * @param initialState The initialState we use as the baseline to track future changes against.
 */
export default class TrackedData<T extends object> {
  private _data: T;
  private baseline: Partial<T>;
  @tracked public errors = new TrackedObject<Partial<Record<keyof T, string>>>(
    {},
  );
  @tracked private _isNew: boolean;
  @tracked public changedValues: (keyof T)[] = new TrackedArray([]);

  constructor(initialState: T, options: { isNew?: boolean } = { isNew: true }) {
    // @ts-expect-error: todo, not sure how to fix this initialState type error
    const data = new TrackedObject(initialState);
    this._isNew = options.isNew ?? true;
    this.baseline = { ...initialState };

    // @ts-expect-error: todo, not sure how to fix this `this.data` type error
    this._data = new Proxy(data, {
      // @ts-expect-error: todo, not sure how to fix this `set` type error
      set: (target: T, prop: keyof T, value: T[keyof T]) => {
        if (target[prop] !== value) {
          target[prop] = value;

          if (this.hasError(prop)) this.removeError(prop);

          // If the value is the same as the baseline, remove it from changedValues
          if (this.baseline[prop] === value) {
            this.changedValues = this.changedValues.filter(
              (key) => key !== prop,
            );
          }
          // Otherwise, add it to changedValues if not already present
          else if (!this.changedValues.includes(prop)) {
            this.changedValues.push(prop);
          }
        }

        return true;
      },
    });
  }

  public get data(): T {
    return this._data;
  }

  public get hasChanges(): boolean {
    return this.changedValues.length > 0;
  }

  public get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  public get isNew(): boolean {
    return this._isNew;
  }

  public addError(key: keyof T, message: string): void {
    this.errors[key] = message;
  }

  public removeError(key: keyof T): void {
    delete this.errors[key];
  }

  public hasError(key: keyof T): boolean {
    return key in this.errors;
  }

  public clearErrors(): void {
    this.errors = new TrackedObject({});
  }

  public acceptChanges(): void {
    Object.assign(this.baseline, this._data);
    this.changedValues = [];
    this._isNew = false;
  }

  public revertChanges(): void {
    if (this.hasChanges) {
      Object.assign(this._data, this.baseline);
      this.changedValues = [];
    }
  }
}
