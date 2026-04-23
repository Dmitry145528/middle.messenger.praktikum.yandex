import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { AppState } from '../../store/types';
import AuthController from '../../controllers/auth-controller';
import LoginPage from './LoginPage';

const storeState: AppState = {
  user: null,
  authLoading: false,
  authError: null,
  profileLoading: false,
  profileError: null,
  chats: [],
  selectedChatId: null,
  chatUsers: [],
  chatMessagesByChatId: {},
  chatsLoading: false,
  chatsError: null
};

jest.mock('../../store/store', () => ({
  __esModule: true,
  default: {
    getState: () => storeState,
    subscribe: jest.fn(() => () => {}),
  },
}));

jest.mock('../../controllers/auth-controller', () => ({
  __esModule: true,
  default: {
    signIn: jest.fn(),
  },
}));

const signIn = AuthController.signIn as ReturnType<typeof jest.fn>;

describe('LoginPage', () => {
  beforeEach(() => {
    storeState.authError = null;
    storeState.authLoading = false;
    signIn.mockClear();
  });

  it('рендерит заголовок и поля логина и пароля', () => {
    const page = new LoginPage();
    const root = page.element();
    expect(root?.querySelector('.login-card__title')?.textContent?.trim()).toBe('Вход');
    expect(root?.querySelector('input[name="login"]')).not.toBeNull();
    expect(root?.querySelector('input[name="password"]')).not.toBeNull();
  });

  it('при пустом submit показывает ошибки валидации', () => {
    const page = new LoginPage();
    const form = page.element()?.querySelector('form');
    expect(form).toBeTruthy();
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const after = page.element();
    const errors = after?.querySelectorAll('.input-group__error-text');
    expect(errors?.length).toBeGreaterThan(0);
  });

  it('при валидных данных вызывает AuthController.signIn', () => {
    const page = new LoginPage();
    const form = page.element()?.querySelector('form') as HTMLFormElement;
    const login = form?.querySelector<HTMLInputElement>('input[name="login"]');
    const password = form?.querySelector<HTMLInputElement>('input[name="password"]');
    if (!login || !password) {
      throw new Error('поля формы не найдены');
    }
    login.value = 'validUser1';
    password.value = 'Password99';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(signIn).toHaveBeenCalledWith({
      login: 'validUser1',
      password: 'Password99',
    });
  });
});
