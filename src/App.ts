import * as Handlebars from 'handlebars';
import { loginPage, registerPage } from './pages';

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

    if (path === '/register') {
      sourceTemplate = registerPage;
    } else if (path !== '/') {
      sourceTemplate = "<h1>404 - Страница не найдена</h1><a href='/'>На главную</a>";
    }

    let template;
    try {
      template = Handlebars.compile(sourceTemplate);
    } catch (e) {
      console.error("Ошибка компиляции Handlebars:", e);
      return;
    }

    this.appElement.innerHTML = template({});
  }
}
