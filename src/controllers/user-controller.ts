import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { userAPI, type UpdateProfilePayload, type UpdatePasswordPayload } from '../api/user-api';
import { authAPI } from '../api/auth-api';
import store from '../store/store';
import Router from '../core/Router';

async function refreshUserInStore(): Promise<void> {
  const user = await authAPI.getUser();
  store.setState('user', user);
}

const UserController = {
  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    store.setState('profileLoading', true);
    store.setState('profileError', null);
    try {
      const user = await userAPI.updateProfile(payload);
      store.setState('user', user);
      store.setState('profileError', null);
      Router.get().go('/profile');
    } catch (e) {
      store.setState('profileError', getApiErrorMessage(e));
    } finally {
      store.setState('profileLoading', false);
    }
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    store.setState('profileLoading', true);
    store.setState('profileError', null);
    try {
      await userAPI.updatePassword(payload);
      await refreshUserInStore();
      store.setState('profileError', null);
      Router.get().go('/profile');
    } catch (e) {
      store.setState('profileError', getApiErrorMessage(e));
    } finally {
      store.setState('profileLoading', false);
    }
  },

  async updateAvatar(file: File): Promise<void> {
    store.setState('profileLoading', true);
    store.setState('profileError', null);
    try {
      const user = await userAPI.updateAvatar(file);
      store.setState('user', user);
      store.setState('profileError', null);
    } catch (e) {
      store.setState('profileError', getApiErrorMessage(e));
    } finally {
      store.setState('profileLoading', false);
    }
  }
};

export default UserController;
