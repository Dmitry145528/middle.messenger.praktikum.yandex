import Block from '../../core/Block';
import template from './register.hbs?raw';
import { validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import './register.css';

interface RegisterPageProps {
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

const REGISTER_FIELDS = ['first_name', 'second_name', 'login', 'email', 'password', 'phone'];

export default class RegisterPage extends Block<RegisterPageProps> {
  protected template = template;

  protected events = {
    submit: (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const data = collectFormData(form) as Record<string, string>;
      console.log('Данные формы регистрации:', data);

      const { isValid, errors } = validateForm(form, REGISTER_FIELDS);
      if (!isValid) {
        this.setProps({ errors, values: data });
        return;
      }
      setTimeout(() => { window.location.href = '/chat'; }, 5000);
    }
  };
}
