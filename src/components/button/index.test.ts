import { describe, expect, it } from '@jest/globals';
import Button from './index';

describe('Button', () => {
  it('рендерит текст и типы кнопки', () => {
    const button = new Button({
      text: 'Войти',
      type: 'primary',
      htmlType: 'submit',
    });
    const el = button.element();
    expect(el?.tagName).toBe('BUTTON');
    expect(el?.textContent?.trim()).toBe('Войти');
    expect(el?.className).toContain('button--primary');
    expect((el as HTMLButtonElement).type).toBe('submit');
  });

  it('при disabled добавляет disabled и aria-busy', () => {
    const button = new Button({
      text: 'Ожидайте',
      type: 'primary',
      htmlType: 'button',
      disabled: true,
    });
    const el = button.element() as HTMLButtonElement | null;
    expect(el?.disabled).toBe(true);
    expect(el?.getAttribute('aria-busy')).toBe('true');
  });
});
