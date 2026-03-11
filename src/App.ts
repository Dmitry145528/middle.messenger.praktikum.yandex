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

    const path = window.location.pathname;

    let sourceTemplate = '';
    let context: any = {};

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

    let template;
    try {
      template = Handlebars.compile(sourceTemplate);
    } catch (e) {
      console.error("Ошибка компиляции Handlebars:", e);
      return;
    }

    this.appElement.innerHTML = template(context);

    const authForm = this.appElement.querySelector('.login-form, .register-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = '/chat';
      });
    }

    if (path === '/chat') {
      const toggleButtons = this.appElement.querySelectorAll('.js-dropdown-toggle');

      toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const parent = button.closest('.chat-options, .chat-attach');
          const menu = parent?.querySelector('.js-dropdown-menu');

          this.appElement?.querySelectorAll('.js-dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('is-active');
          });

          menu?.classList.toggle('is-active');
        });
      });

      document.addEventListener('click', () => {
        this.appElement?.querySelectorAll('.js-dropdown-menu').forEach(menu => {
          menu.classList.remove('is-active');
        });
      });
    }

    const backBtn = this.appElement.querySelector('#backToChat');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = '/chat';
      });
    }

    const backToMainBtn = this.appElement.querySelector('#backToMain');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }
}
