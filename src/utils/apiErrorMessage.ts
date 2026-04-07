import { HttpFailureError } from './httpErrors';

export type ApiErrorContext = 'auth' | 'default';

export function getApiErrorMessage(err: unknown, context: ApiErrorContext = 'default'): string {
  if (err instanceof HttpFailureError) {
    try {
      const parsed = JSON.parse(err.responseText) as { reason?: string };
      if (parsed.reason) return parsed.reason;
    } catch {
      if (err.responseText) return err.responseText;
    }
    if (err.status === 401) {
      return context === 'auth' ? 'Неверный логин или пароль' : 'Нужна авторизация';
    }
    if (err.status === 400) return 'Некорректный запрос';
  }
  return 'Произошла ошибка, попробуйте ещё раз';
}
