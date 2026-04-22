import { describe, expect, it } from '@jest/globals';
import Input from './index';

describe('Input', () => {
  it('рендерит подпись, поле и значение', () => {
    const input = new Input({
      label: 'Логин',
      name: 'login',
      value: 'user1',
      placeholder: 'Введите логин',
    });
    const root = input.element();
    expect(root?.querySelector('.input-group__label')?.textContent).toBe('Логин');
    const field = root?.querySelector('input[name="login"]') as HTMLInputElement | null;
    expect(field?.value).toBe('user1');
    expect(field?.getAttribute('placeholder')).toBe('Введите логин');
  });

  it('при blur подставляет ошибку валидации для невалидного логина', () => {
    const input = new Input({
      name: 'login',
      value: 'x',
    });
    const field = input.element()?.querySelector('input') as HTMLInputElement;
    field?.dispatchEvent(new Event('blur', { bubbles: true }));
    const rootAfter = input.element();
    const err = rootAfter?.querySelector('.input-group__error-text');
    expect(err?.textContent).toBeTruthy();
  });

  it('при blur убирает ошибку для валидного логина', () => {
    const input = new Input({
      name: 'login',
      value: 'validUser',
    });
    const field = input.element()?.querySelector('input') as HTMLInputElement;
    field?.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(input.element()?.querySelector('.input-group__error-text')).toBeNull();
  });
});
