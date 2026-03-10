import * as Handlebars from 'handlebars';
import { loginPage } from './pages';

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

    let template;
    try {
      template = Handlebars.compile(loginPage || "<h1>Страница в разработке</h1>");
    } catch (e) {
      console.error("Ошибка компиляции Handlebars:", e);
      return;
    }

    this.appElement.innerHTML = template({});
  }
}
