export class HttpFailureError extends Error {
  readonly status: number;

  readonly responseText: string;

  constructor(status: number, statusText: string, responseText: string) {
    super(statusText || `HTTP ${status}`);
    this.name = 'HttpFailureError';
    this.status = status;
    this.responseText = responseText;
  }
}
