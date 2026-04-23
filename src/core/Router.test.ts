import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../controllers/auth-guard', () => ({
  resolveAuthRedirect: jest.fn(() => null),
}));

function makeBlock() {
  return {
    element: () => document.createElement('div'),
    detach: jest.fn(),
  };
}

describe('Роутер', () => {
  let Router: typeof import('./Router').default;

  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>';
    jest.resetModules();
    const mod = await import('./Router');
    Router = mod.default;
  });

  it('get бросает ошибку, если create ещё не вызывали', () => {
    expect(() => {
      Router.get();
    }).toThrow('Router не инициализирован');
  });

  it('повторный create возвращает тот же экземпляр (синглтон)', () => {
    const a = Router.create('#app');
    const b = Router.create('#app');
    expect(a).toBe(b);
  });

  it('get возвращает экземпляр после create', () => {
    const r = Router.create('#app');
    expect(Router.get()).toBe(r);
  });

  it('use регистрирует путь, getRoute его находит', () => {
    const r = Router.create('#app');
    r.use('/sign-in', makeBlock);
    expect(r.getRoute('/sign-in')).toBeDefined();
    expect(r.getRoute('/other')).toBeUndefined();
  });

  it('use возвращает роутер для цепочки вызовов', () => {
    const r = Router.create('#app');
    const chained = r.use('/a', makeBlock).use('/b', makeBlock);
    expect(chained).toBe(r);
    expect(r.getRoute('/a')).toBeDefined();
    expect(r.getRoute('/b')).toBeDefined();
  });

  it('go обновляет историю браузера и рендерит в корневой контейнер', () => {
    const push = jest.spyOn(window.history, 'pushState');
    const r = Router.create('#app');
    r.use('/chat', makeBlock);
    r.go('/chat');
    expect(push).toHaveBeenCalledWith({}, '', '/chat');
    expect(document.querySelector('#app')?.querySelector('div')).not.toBeNull();
    push.mockRestore();
  });

  it('go сопоставляет путь, если в адресе есть строка запроса и фрагмент', () => {
    const r = Router.create('#app');
    r.use('/items', makeBlock);
    r.go('/items?sort=1#top');
    expect(document.querySelector('#app')?.querySelector('div')).not.toBeNull();
  });

  it('go подставляет /404, если маршрут не найден', () => {
    const r = Router.create('#app');
    r.use('/404', makeBlock);
    r.go('/missing-route');
    expect(document.querySelector('#app')?.querySelector('div')).not.toBeNull();
  });

  it('предыдущий блок отсоединяется при смене маршрута через go', () => {
    const detachFirst = jest.fn();
    const detachSecond = jest.fn();
    const r = Router.create('#app');
    r.use('/first', () => ({
      element: () => document.createElement('div'),
      detach: detachFirst,
    }));
    r.use('/second', () => ({
      element: () => document.createElement('div'),
      detach: detachSecond,
    }));
    r.go('/first');
    r.go('/second');
    expect(detachFirst).toHaveBeenCalled();
    expect(detachSecond).not.toHaveBeenCalled();
  });
});
