import { HttpFailureError } from '../utils/httpErrors';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { authAPI, type SignInPayload, type SignUpPayload } from '../api/auth-api';
import store from '../store/store';
import Router from '../core/Router';

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
    /* нет сессии после signup */
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
    store.patch({ authLoading: true, authError: null });
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
      store.patch({ authError: null, authLoading: false });
      Router.get().go('/messenger');
    } catch (e) {
      store.patch({
        authError: getApiErrorMessage(e, 'auth'),
        authLoading: false
      });
    }
  },

  async signUp(payload: SignUpPayload): Promise<void> {
    store.patch({ authLoading: true, authError: null });
    try {
      await authAPI.signUp(payload);
      await establishSessionAfterSignUp(payload);
      store.patch({ authError: null, authLoading: false });
      Router.get().go('/messenger');
    } catch (e) {
      store.patch({
        authError: getApiErrorMessage(e, 'auth'),
        authLoading: false
      });
    }
  },

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch {
      /* всё равно чистим клиент */
    }
    store.patch({
      user: null,
      authError: null,
      authLoading: false,
      profileError: null,
      profileLoading: false,
      chats: [],
      selectedChatId: null,
      chatsError: null,
      chatsLoading: false
    });
    Router.get().go('/');
  }
};

export default AuthController;
