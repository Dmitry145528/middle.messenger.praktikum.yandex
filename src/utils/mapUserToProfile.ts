import type { User } from '../store/types';
import type { ProfileData } from '../pages/profile/profile-types';
import { resolveAvatarUrl } from './avatarUrl';

export function mapUserToProfileData(user: User): ProfileData {
  const avatar = resolveAvatarUrl(user.avatar);

  return {
    avatar,
    first_name: user.first_name,
    second_name: user.second_name,
    display_name: user.display_name,
    login: user.login,
    email: user.email,
    phone: user.phone
  };
}
