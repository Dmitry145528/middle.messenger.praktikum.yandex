import Route, { type BlockFactory } from './Route';
import { resolveAuthRedirect } from '../controllers/auth-guard';

export default class Router {
  private static _singleton: Router | null = null;

  routes: Route[] = [];

  history = window.history;

  private _currentRoute: Route | null = null;

  private readonly _rootQuery: string;

  private constructor(rootQuery: string) {
    this._rootQuery = rootQuery;
  }

  static create(rootQuery: string): Router {
    if (Router._singleton) {
      return Router._singleton;
    }
    Router._singleton = new Router(rootQuery);
    return Router._singleton;
  }

  static get(): Router {
    if (!Router._singleton) {
      throw new Error('Router не инициализирован');
    }
    return Router._singleton;
  }

  use(pathname: string, blockFactory: BlockFactory): this {
    const route = new Route(pathname, blockFactory, { rootQuery: this._rootQuery });
    this.routes.push(route);
    return this;
  }

  start(): void {
    window.onpopstate = () => {
      this._onRoute(this._fullLocationPath());
    };

    document.addEventListener('click', this._onLinkClick);

    this._onRoute(this._fullLocationPath());
  }

  private _fullLocationPath(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  private _onLinkClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Node)) return;

    const anchor = target instanceof Element ? target.closest('a[href]') : null;
    if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;

    if (/\.[a-z0-9]+$/i.test(url.pathname)) return;

    event.preventDefault();
    this.go(`${url.pathname}${url.search}${url.hash}`);
  };

  go(path: string): void {
    this.history.pushState({}, '', path);
    this._onRoute(path);
  }

  private _pathnameFromFullPath(fullPath: string): string {
    const i = fullPath.indexOf('?');
    const j = fullPath.indexOf('#');
    let end = fullPath.length;
    if (i !== -1) end = Math.min(end, i);
    if (j !== -1) end = Math.min(end, j);
    return fullPath.slice(0, end);
  }

  getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  private _onRoute(fullPath: string): void {
    let pathname = this._pathnameFromFullPath(fullPath);
    const redirect = resolveAuthRedirect(pathname);
    if (redirect && redirect !== pathname) {
      this.history.replaceState({}, '', redirect);
      pathname = redirect;
    }
    const route = this.getRoute(pathname) ?? this.getRoute('/404');
    if (!route) return;

    if (this._currentRoute) {
      this._currentRoute.leave();
    }

    route.render();
    this._currentRoute = route;
  }
}
