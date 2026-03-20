import * as Handlebars from 'handlebars';
import {
  LoginPage,
  RegisterPage,
  ProfilePage,
  chatPage,
  chatList,
  messageList,
  profileData,
  profileEditData,
  passwordEditData,
  error404Page,
  error500Page
} from './pages';

type PageComponent = {
  element: () => HTMLElement | null;
};

export default class App {
  appElement: HTMLElement | null;
  private pageComponent: PageComponent | null = null;

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
    type AppContext = EmptyContext | ChatContext;

    let sourceTemplate: string = '';
    let context: AppContext = {} as EmptyContext;
    let pageComponent: PageComponent | null = null;

    switch (path) {
      case '/':
        pageComponent = new LoginPage();
        break;
      case '/register':
        pageComponent = new RegisterPage();
        break;
      case '/chat':
        sourceTemplate = chatPage;
        context = { chatList, messageList };
        break;
      case '/profile':
        pageComponent = new ProfilePage(profileData);
        break;
      case '/profile-edit':
        pageComponent = new ProfilePage(profileEditData);
        break;
      case '/password-edit':
        pageComponent = new ProfilePage(passwordEditData);
        break;
      case '/500':
        sourceTemplate = error500Page;
        break;
      default:
        sourceTemplate = error404Page;
        break;
    }

    if (pageComponent) {
      this.pageComponent = pageComponent;
      const element = this.pageComponent.element();
      if (!element) {
        console.error('Не удалось отрендерить страницу компонента');
        return;
      }
      root.innerHTML = '';
      root.appendChild(element);
    } else {
      try {
        const template = Handlebars.compile(sourceTemplate) as unknown as (ctx: AppContext) => string;
        root.innerHTML = template(context);
      } catch (e) {
        console.error('Ошибка рендеринга Handlebars:', e);
        return;
      }
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
