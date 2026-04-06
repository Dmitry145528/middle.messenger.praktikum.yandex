import type { AppState, Indexed } from './types';
import { merge } from '../utils/merge';
import { setByPath } from '../utils/set';

type Listener = () => void;

const initialState: AppState = {
  user: null,
  authLoading: false,
  authError: null
};

class Store {
  private state: Indexed = { ...initialState };

  private listeners: Set<Listener> = new Set();

  public getState(): AppState {
    return this.state as AppState;
  }

  public setState(path: string, value: unknown): void {
    if (path.includes('.')) {
      this.state = merge(this.state, setByPath(path, value));
    } else {
      this.state = { ...this.state, [path]: value };
    }
    this.emit();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export default new Store();
