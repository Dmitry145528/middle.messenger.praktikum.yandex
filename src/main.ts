import Handlebars from 'handlebars';
import Router from './core/Router';
import { Partials } from './components';
import {
  LoginPage,
  RegisterPage,
  ProfilePage,
  ChatPage,
  chatList,
  messageList,
  profileData
} from './pages';
import Error404Page from './pages/404/Error404Page';
import Error500Page from './pages/500/Error500Page';
import AuthController from './controllers/auth-controller';
import store from './store/store';
import { mapUserToProfileData } from './utils/mapUserToProfile';
import { mapUserToChatSidebar } from './utils/chatSidebarUser';

import './index.css';

Object.entries(Partials).forEach(([name, template]) => {
  Handlebars.registerPartial(name, template);
});

function buildProfileViewPage(): ProfilePage {
  const u = store.getState().user;
  const base = u ? mapUserToProfileData(u) : profileData;
  return new ProfilePage({ ...base, errors: {} });
}

function buildProfileEditPage(): ProfilePage {
  const u = store.getState().user;
  const base = u ? mapUserToProfileData(u) : profileData;
  return new ProfilePage({ ...base, isEdit: true, errors: {} });
}

function buildPasswordEditPage(): ProfilePage {
  const u = store.getState().user;
  const base = u ? mapUserToProfileData(u) : profileData;
  return new ProfilePage({ ...base, isPasswordEdit: true, errors: {} });
}

document.addEventListener('DOMContentLoaded', () => {
  const router = Router.create('#app');

  router
    .use('/', () => new LoginPage({}))
    .use('/sign-up', () => new RegisterPage({}))
    .use('/profile', () => buildProfileViewPage())
    .use('/profile-edit', () => buildProfileEditPage())
    .use('/password-edit', () => buildPasswordEditPage())
    .use('/messenger', () =>
      new ChatPage({
        chatList,
        messageList,
        ...mapUserToChatSidebar(store.getState().user)
      })
    )
    .use('/404', () => new Error404Page())
    .use('/500', () => new Error500Page());

  void AuthController.bootstrap().then(() => {
    router.start();
  });
});
