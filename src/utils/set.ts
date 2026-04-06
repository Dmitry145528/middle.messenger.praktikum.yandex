import type { Indexed } from '../store/types';

export function setByPath(path: string, value: unknown): Indexed {
  const keys = path.split('.');
  const root: Indexed = {};
  let current: Indexed = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (k === undefined) break;
    const next: Indexed = {};
    current[k] = next;
    current = next;
  }

  const leaf = keys[keys.length - 1];
  if (leaf !== undefined) {
    current[leaf] = value;
  }
  return root;
}
