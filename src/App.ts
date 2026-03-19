import * as Handlebars from 'handlebars';
import {
  loginPage,
  registerPage,
  chatPage,
  chatList,
  messageList,
  profilePage,
  profileData,
  profileEditData,
  passwordEditData,
  error404Page,
  error500Page
} from './pages';

export default class App {
  appElement: HTMLElement | null;

  constructor() {
    this.appElement = document.getElementById('app');
  }

  render() {
    if (!this.appElement) {
      console.error('Корневой элемент #app не найден!');
      return;
    }

    const root = this.appElement;
    const path: string = window.location.pathname;

    type EmptyContext = Record<string, never>;
    type ChatContext = { chatList: typeof chatList; messageList: typeof messageList };
    type AppContext =
      | EmptyContext
      | ChatContext
      | typeof profileData
      | typeof profileEditData
      | typeof passwordEditData;

    let sourceTemplate: string = '';
    let context: AppContext = {} as EmptyContext;

    switch (path) {
      case '/':
        sourceTemplate = loginPage;
        break;
      case '/register':
        sourceTemplate = registerPage;
        break;
      case '/chat':
        sourceTemplate = chatPage;
        context = { chatList, messageList };
        break;
      case '/profile':
        sourceTemplate = profilePage;
        context = profileData;
        break;
      case '/profile-edit':
        sourceTemplate = profilePage;
        context = profileEditData;
        break;
      case '/password-edit':
        sourceTemplate = profilePage;
        context = passwordEditData;
        break;
      case '/500':
        sourceTemplate = error500Page;
        break;
      default:
        sourceTemplate = error404Page;
        break;
    }

    try {
      const template = Handlebars.compile(sourceTemplate) as unknown as (ctx: AppContext) => string;
      root.innerHTML = template(context);
    } catch (e) {
      console.error('Ошибка рендеринга Handlebars:', e);
      return;
    }

    const authForm = root.querySelector<HTMLFormElement>('.login-form, .register-form');
    if (authForm) {
      authForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        window.location.href = '/chat';
      });
    }

    if (path === '/chat') {
      const toggleButtons = root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle');

      toggleButtons.forEach(button => {
        button.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation();
          const parent = button.closest<HTMLElement>('.chat-options, .chat-attach');
          const menu = parent?.querySelector<HTMLElement>('.js-dropdown-menu');

          root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('is-active');
          });

          menu?.classList.toggle('is-active');
        });
      });

      document.addEventListener('click', () => {
        root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach(menu => {
          menu.classList.remove('is-active');
        });
      });
    }

    const backBtn = root.querySelector<HTMLAnchorElement>('#backToChat');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = '/chat';
      });
    }

    const backToMainBtn = root.querySelector<HTMLAnchorElement>('#backToMain');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }
}
