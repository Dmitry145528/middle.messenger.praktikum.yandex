export function queryStringify(data: Record<string, unknown>): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be a non-null object');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return '';
  }

  const parts: string[] = [];
  for (const key of keys) {
    const v = data[key];
    if (v === undefined || v === null) continue;
    let encodedValue: string;
    if (typeof v === 'string') {
      encodedValue = v;
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      encodedValue = String(v);
    } else if (typeof v === 'bigint') {
      encodedValue = v.toString();
    } else {
      throw new Error('queryStringify: only string, number, boolean, bigint values are allowed');
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(encodedValue)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
