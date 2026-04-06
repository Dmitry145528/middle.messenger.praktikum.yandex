import store from '../store/store';

const protectedPaths = new Set(['/messenger', '/settings', '/profile-edit', '/password-edit']);

export function resolveAuthRedirect(pathname: string): string | null {
  const user = store.getState().user;
  if (user && (pathname === '/' || pathname === '/sign-up')) {
    return '/messenger';
  }
  if (!user && protectedPaths.has(pathname)) {
    return '/';
  }
  return null;
}
