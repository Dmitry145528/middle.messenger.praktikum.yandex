import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { AppState } from '../../store/types';
import AuthController from '../../controllers/auth-controller';
import RegisterPage from './RegisterPage';

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
    signUp: jest.fn(),
  },
}));

const signUp = AuthController.signUp as ReturnType<typeof jest.fn>;

describe('RegisterPage', () => {
  beforeEach(() => {
    storeState.authError = null;
    storeState.authLoading = false;
    signUp.mockClear();
  });

  it('рендерит поля регистрации', () => {
    const page = new RegisterPage();
    const root = page.element();
    expect(root?.querySelector('.register-card__title')?.textContent?.trim()).toBe('Регистрация');
    for (const name of ['first_name', 'second_name', 'login', 'email', 'password', 'phone']) {
      expect(root?.querySelector(`input[name="${name}"]`)).not.toBeNull();
    }
  });

  it('при валидной форме вызывает AuthController.signUp', () => {
    const page = new RegisterPage();
    const form = page.element()?.querySelector('form') as HTMLFormElement;
    (form.querySelector('input[name="first_name"]') as HTMLInputElement).value = 'Иван';
    (form.querySelector('input[name="second_name"]') as HTMLInputElement).value = 'Петров';
    (form.querySelector('input[name="login"]') as HTMLInputElement).value = 'validUser1';
    (form.querySelector('input[name="email"]') as HTMLInputElement).value = 'user@mail.com';
    (form.querySelector('input[name="password"]') as HTMLInputElement).value = 'Password99';
    (form.querySelector('input[name="phone"]') as HTMLInputElement).value = '+79001234567';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(signUp).toHaveBeenCalledWith({
      first_name: 'Иван',
      second_name: 'Петров',
      login: 'validUser1',
      email: 'user@mail.com',
      password: 'Password99',
      phone: '+79001234567',
    });
  });
});
