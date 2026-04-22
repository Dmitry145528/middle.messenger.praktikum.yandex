import { describe, expect, it } from '@jest/globals';
import Error404Page from './Error404Page';

describe('Error404Page', () => {
  it('показывает код и ссылки', () => {
    const page = new Error404Page();
    const root = page.element();
    expect(root?.querySelector('.error-page__code')?.textContent).toBe('404');
    expect(root?.textContent).toContain('Страница не найдена');
    const links = root?.querySelectorAll('a[href]');
    expect(links?.length).toBeGreaterThanOrEqual(1);
  });
});
