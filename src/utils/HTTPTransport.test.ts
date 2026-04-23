import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpFailureError } from './httpErrors';
import HTTPTransport from './HTTPTransport';

type MockXhr = {
  open: jest.Mock;
  send: jest.Mock;
  setRequestHeader: jest.Mock;
  getResponseHeader: jest.Mock;
  status: number;
  statusText: string;
  responseText: string;
  response: unknown;
  responseType: XMLHttpRequestResponseType;
  withCredentials: boolean;
  timeout: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  ontimeout: (() => void) | null;
};

function createMockXhr(): MockXhr {
  return {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    getResponseHeader: jest.fn(),
    status: 200,
    statusText: 'OK',
    responseText: '',
    response: null,
    responseType: '',
    withCredentials: false,
    timeout: 0,
    onload: null,
    onerror: null,
    onabort: null,
    ontimeout: null,
  };
}

describe('HTTPTransport', () => {
  const OriginalXHR = globalThis.XMLHttpRequest;
  let instances: MockXhr[];

  beforeEach(() => {
    instances = [];
    globalThis.XMLHttpRequest = jest.fn(function (this: unknown) {
      const xhr = createMockXhr();
      instances.push(xhr);
      return xhr;
    }) as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = OriginalXHR;
  });

  it('get: успех с JSON и Content-Type application/json', async () => {
    const t = new HTTPTransport('https://api.example.com');
    const p = t.get('user/1');
    const xhr = instances[0];
    expect(xhr.open).toHaveBeenCalledWith('GET', 'https://api.example.com/user/1');
    xhr.status = 200;
    xhr.responseText = '{"id":1}';
    xhr.getResponseHeader.mockReturnValue('application/json; charset=utf-8');
    xhr.onload?.();
    await expect(p).resolves.toEqual({ id: 1 });
  });

  it('get: добавляет query из объекта data', async () => {
    const t = new HTTPTransport('https://api.example.com');
    const p = t.get('search', { data: { q: 'hi', n: 2 } });
    const xhr = instances[0];
    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      'https://api.example.com/search?q=hi&n=2',
    );
    xhr.status = 200;
    xhr.responseText = '[]';
    xhr.getResponseHeader.mockReturnValue('application/json');
    xhr.onload?.();
    await expect(p).resolves.toEqual([]);
  });

  it('post: отправляет JSON и заголовок Content-Type', async () => {
    const t = new HTTPTransport('https://api.example.com');
    const p = t.post('auth', { data: { login: 'a', pass: 'b' } });
    const xhr = instances[0];
    expect(xhr.open).toHaveBeenCalledWith('POST', 'https://api.example.com/auth');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(xhr.send).toHaveBeenCalledWith(JSON.stringify({ login: 'a', pass: 'b' }));
    xhr.status = 201;
    xhr.responseText = '{"ok":true}';
    xhr.getResponseHeader.mockReturnValue('application/json');
    xhr.onload?.();
    await expect(p).resolves.toEqual({ ok: true });
  });

  it('при статусе 4xx отклоняет с HttpFailureError', async () => {
    const t = new HTTPTransport('https://api.example.com');
    const p = t.get('x');
    const xhr = instances[0];
    xhr.status = 404;
    xhr.statusText = 'Not Found';
    xhr.responseText = 'gone';
    xhr.onload?.();
    const err = await p.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpFailureError);
    expect((err as HttpFailureError).status).toBe(404);
    expect((err as HttpFailureError).responseText).toBe('gone');
  });

  it('request: без method бросает ошибку', async () => {
    const t = new HTTPTransport('https://api.example.com');
    await expect(
      t.request('path', {}),
    ).rejects.toThrow('HTTP method is required');
  });

  it('onerror отклоняет с сетевой ошибкой', async () => {
    const t = new HTTPTransport('https://api.example.com');
    const p = t.get('x');
    const xhr = instances[0];
    xhr.onerror?.();
    await expect(p).rejects.toThrow('Network error');
  });
});
