import { describe, expect, it } from '@jest/globals';
import Link from './index';

describe('Link', () => {
  it('рендерит href, текст и класс', () => {
    const link = new Link({
      text: 'На главную',
      href: '/messenger',
      className: 'link--back',
    });
    const el = link.element();
    expect(el?.tagName).toBe('A');
    expect(el?.textContent?.trim()).toBe('На главную');
    expect((el as HTMLAnchorElement).getAttribute('href')).toBe('/messenger');
    expect(el?.className).toContain('link--back');
  });
});
