import { describe, expect, it } from '@jest/globals';
import Error500Page from './Error500Page';

describe('Error500Page', () => {
  it('показывает код 500 и ссылку назад', () => {
    const page = new Error500Page();
    const root = page.element();
    expect(root?.querySelector('.error-page__code')?.textContent).toBe('500');
    expect(root?.textContent).toContain('фиксим');
    expect(root?.querySelector('a[href="/messenger"]')).not.toBeNull();
  });
});
