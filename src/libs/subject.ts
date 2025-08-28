export type Subscriber<T> = (newState: T, prevState: T) => void;

export interface Subscription {
  unsubscribe(): void;
  readonly closed: boolean;
}

export class Subject<T> {
  private state: T;
  private subscribers = new Set<Subscriber<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  public getState(): T {
    return this.state;
  }

  public setState(next: T | ((prev: T) => T)): void {
    const newState =
      typeof next === 'function' ? (next as (prev: T) => T)(this.state) : next;

    if (Object.is(this.state, newState)) return;

    const prevState = this.state;
    this.state = newState;
    this.notify(newState, prevState);
  }

  public subscribe(subscriber: Subscriber<T>): Subscription {
    const handler: Subscriber<T> = (n, p) => subscriber(n, p);
    this.subscribers.add(handler);
    let closed = false;
    return {
      get closed() {
        return closed;
      },
      unsubscribe: () => {
        if (closed) return;
        closed = true;
        this.subscribers.delete(handler);
      },
    };
  }

  private notify(newState: T, prevState: T): void {
    const snapshot = Array.from(this.subscribers);
    for (const sub of snapshot) {
      try {
        sub(newState, prevState);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    }
  }
}
