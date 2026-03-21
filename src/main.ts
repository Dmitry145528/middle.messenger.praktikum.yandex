import App from './App';
import Handlebars from 'handlebars';

import './index.css';

import { Partials } from './components';

Object.entries(Partials).forEach(([name, template]) => {
  Handlebars.registerPartial(name, template);
});

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.render();
});
