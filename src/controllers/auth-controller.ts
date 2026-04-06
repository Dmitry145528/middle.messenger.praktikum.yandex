import { HttpFailureError } from '../utils/httpErrors';
import { authAPI, type SignInPayload, type SignUpPayload } from '../api/auth-api';
import store from '../store/store';
import Router from '../core/Router';

function messageFromError(err: unknown): string {
  if (err instanceof HttpFailureError) {
    try {
      const parsed = JSON.parse(err.responseText) as { reason?: string };
      if (parsed.reason) return parsed.reason;
    } catch {
      if (err.responseText) return err.responseText;
    }
    if (err.status === 401) return 'Неверный логин или пароль';
    if (err.status === 400) return 'Некорректный запрос';
  }
  return 'Произошла ошибка, попробуйте ещё раз';
}

function reasonFromHttpError(err: HttpFailureError): string | undefined {
  try {
    const parsed = JSON.parse(err.responseText) as { reason?: string };
    return parsed.reason;
  } catch {
    return undefined;
  }
}

function isAlreadyInSystemError(err: unknown): boolean {
  if (!(err instanceof HttpFailureError)) return false;
  const reason = reasonFromHttpError(err);
  return Boolean(reason && /already in system/i.test(reason));
}

async function loadUserIntoStore(): Promise<void> {
  const user = await authAPI.getUser();
  store.setState('user', user);
}

async function establishSessionAfterSignUp(payload: SignUpPayload): Promise<void> {
  try {
    await loadUserIntoStore();
    return;
  } catch {
  }

  try {
    await authAPI.signIn({ login: payload.login, password: payload.password });
    await loadUserIntoStore();
  } catch (e) {
    if (isAlreadyInSystemError(e)) {
      await loadUserIntoStore();
      return;
    }
    throw e;
  }
}

const AuthController = {
  async bootstrap(): Promise<void> {
    try {
      await loadUserIntoStore();
    } catch {
      store.setState('user', null);
    }
  },

  async signIn(payload: SignInPayload): Promise<void> {
    store.setState('authLoading', true);
    store.setState('authError', null);
    try {
      try {
        await authAPI.signIn(payload);
        await loadUserIntoStore();
      } catch (e) {
        if (isAlreadyInSystemError(e)) {
          await loadUserIntoStore();
        } else {
          throw e;
        }
      }
      store.setState('authError', null);
      Router.get().go('/messenger');
    } catch (e) {
      store.setState('authError', messageFromError(e));
    } finally {
      store.setState('authLoading', false);
    }
  },

  async signUp(payload: SignUpPayload): Promise<void> {
    store.setState('authLoading', true);
    store.setState('authError', null);
    try {
      await authAPI.signUp(payload);
      await establishSessionAfterSignUp(payload);
      store.setState('authError', null);
      Router.get().go('/messenger');
    } catch (e) {
      store.setState('authError', messageFromError(e));
    } finally {
      store.setState('authLoading', false);
    }
  },

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch {
    }
    store.setState('user', null);
    store.setState('authError', null);
    Router.get().go('/');
  }
};

export default AuthController;
