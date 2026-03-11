import App from './App';
import Handlebars from 'handlebars';

import './index.css';

import { Components } from './components';

Object.entries(Components).forEach(([name, template]) => {
  Handlebars.registerPartial(name, template);
});

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.render();
});
