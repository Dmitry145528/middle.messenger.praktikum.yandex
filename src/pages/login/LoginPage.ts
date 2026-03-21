import Block from '../../core/Block';
import template from './login.hbs?raw';
import { validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import './login.css';

interface LoginPageProps {
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

const LOGIN_FIELDS = ['login', 'password'];

export default class LoginPage extends Block<LoginPageProps> {
  protected template = template;

  protected events = {
    submit: (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const data = collectFormData(form) as Record<string, string>;
      console.log('Данные формы входа:', data);

      const { isValid, errors } = validateForm(form, LOGIN_FIELDS);
      if (!isValid) {
        this.setProps({ errors, values: data });
        return;
      }
      setTimeout(() => { window.location.href = '/chat'; }, 5000);
    }
  };
}
