import Block from '../../core/Block';
import template from './login.hbs?raw';
import './login.css';

export default class LoginPage extends Block {
  protected template = template;

  protected events = {
    submit: (event: SubmitEvent) => {
      event.preventDefault();
      window.location.href = '/chat';
    }
  };
}
