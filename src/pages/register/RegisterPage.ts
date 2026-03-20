import Block from '../../core/Block';
import template from './register.hbs?raw';
import './register.css';

export default class RegisterPage extends Block {
  protected template = template;

  protected events = {
    submit: (event: SubmitEvent) => {
      event.preventDefault();
      window.location.href = '/chat';
    }
  };
}
