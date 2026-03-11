import * as Handlebars from 'handlebars';
import { loginPage, registerPage, chatPage } from './pages';
import { chatList, messageList } from './pages/chat';

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

    let sourceTemplate = loginPage;

    switch (path) {
      case '/':
        sourceTemplate = loginPage;
        break;
      case '/register':
        sourceTemplate = registerPage;
        break;
      case '/chat':
        sourceTemplate = chatPage;
        break;
      default:
        sourceTemplate = `
          <div class="login-card" style="text-align: center;">
            <h1 class="login-card__title" style="margin-bottom: 20px;">404</h1>
            <p style="margin-bottom: 30px; color: var(--color-text-muted); font-size: 14px;">Страница не найдена</p>
            <form action="/" method="GET" style="width: 100%;">
              {{> Button text="На главную" type="primary" htmlType="submit" }}
            </form>
          </div>
        `;
        break;
    }

    let template;
    try {
      template = Handlebars.compile(sourceTemplate);
    } catch (e) {
      console.error("Ошибка компиляции Handlebars:", e);
      return;
    }

    this.appElement.innerHTML = template({
      chatList,
      messageList
    });

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
  }
}
