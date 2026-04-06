import type { Indexed } from '../store/types';

function isPlainObject(x: unknown): x is Indexed {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function merge(a: Indexed, b: Indexed): Indexed {
  const out: Indexed = { ...a };
  for (const key of Object.keys(b)) {
    const bv = b[key];
    const av = out[key];
    if (isPlainObject(bv) && isPlainObject(av)) {
      out[key] = merge(av, bv);
    } else {
      out[key] = bv;
    }
  }
  return out;
}
