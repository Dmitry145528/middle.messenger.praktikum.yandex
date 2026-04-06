import { API_HOST } from '../config/api';
import type { User } from '../store/types';
import type { ProfileData } from '../pages/profile/profile-types';

export function mapUserToProfileData(user: User): ProfileData {
  const avatar =
    user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://'))
      ? user.avatar
      : user.avatar
        ? `${API_HOST}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`
        : '';

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
