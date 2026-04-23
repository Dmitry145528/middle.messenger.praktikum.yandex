import type { User } from '../store/types';
import { resolveAvatarUrl } from './avatarUrl';

export function mapUserToChatSidebar(user: User | null) {
  if (!user) {
    return { sidebarUserName: 'Профиль', sidebarUserAvatarRemote: '' };
  }
  const { first_name, second_name, display_name } = user;
  const name =
    display_name?.trim() ||
    `${first_name ?? ''} ${second_name ?? ''}`.trim() ||
    user.login ||
    'Профиль';
  return {
    sidebarUserName: name,
    sidebarUserAvatarRemote: resolveAvatarUrl(user.avatar)
  };
}
