import { queryStringify } from './queryStringify';
import { HttpFailureError } from './httpErrors';

const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
} as const;

type Method = (typeof METHODS)[keyof typeof METHODS];

type RequestOptions = {
  headers?: Record<string, string>;
  method?: Method;
  data?: unknown;
  timeout?: number;
  responseType?: XMLHttpRequestResponseType;
};

type MethodOptions = Omit<RequestOptions, 'method'>;

function joinURL(base: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const b = base.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${b}/${p}`;
}

export default class HTTPTransport {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  get(url: string, options: MethodOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: METHODS.GET }, options.timeout);
  }

  post(url: string, options: MethodOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: METHODS.POST }, options.timeout);
  }

  put(url: string, options: MethodOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: METHODS.PUT }, options.timeout);
  }

  delete(url: string, options: MethodOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: METHODS.DELETE }, options.timeout);
  }

  request(url: string, options: RequestOptions = {}, timeout = 15000): Promise<unknown> {
    const { headers = {}, method, data, responseType } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(new Error('HTTP method is required'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;
      const fullUrl = joinURL(this.baseURL, url);

      xhr.open(method, isGet && data && typeof data === 'object' && !(data instanceof FormData)
        ? `${fullUrl}${queryStringify(data as Record<string, unknown>)}`
        : fullUrl);

      xhr.withCredentials = true;

      if (responseType) {
        xhr.responseType = responseType;
      }

      Object.keys(headers).forEach((key) => {
        const value = headers[key];
        if (value !== undefined) {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response: unknown;
          if (xhr.responseType) {
            response = xhr.response;
          } else {
            try {
              const contentType = xhr.getResponseHeader('Content-Type');
              if (contentType?.includes('application/json') && xhr.responseText) {
                response = JSON.parse(xhr.responseText);
              } else {
                response = xhr.responseText;
              }
            } catch {
              response = xhr.responseText;
            }
          }
          resolve(response);
        } else {
          reject(new HttpFailureError(xhr.status, xhr.statusText, xhr.responseText));
        }
      };

      xhr.onabort = () => {
        reject(new Error('Request aborted'));
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.timeout = timeout;

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      if (isGet || data === undefined || data === null) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object') {
        const h = { ...headers };
        if (!h['Content-Type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data as string);
      }
    });
  }
}
