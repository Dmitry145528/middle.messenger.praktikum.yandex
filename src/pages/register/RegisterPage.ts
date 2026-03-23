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
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      const form = target;

      const { isValid, errors } = validateForm(form, REGISTER_FIELDS);
      if (!isValid) {
        const data = collectFormData(form) as Record<string, string>;
        this.setProps({ errors, values: data });
        return;
      }

      const data = collectFormData(form) as Record<string, string>;
      console.log('Данные формы регистрации:', data);
      setTimeout(() => { window.location.href = '/chat'; }, 5000);
    }
  };
}
