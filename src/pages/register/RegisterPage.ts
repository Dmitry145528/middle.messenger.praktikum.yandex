import Block from '../../core/Block';
import template from './register.hbs?raw';
import { validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import store from '../../store/store';
import AuthController from '../../controllers/auth-controller';
import './register.css';

interface RegisterPageProps {
  errors?: Record<string, string>;
  values?: Record<string, string>;
  authError?: string;
  authLoading?: boolean;
}

const REGISTER_FIELDS = ['first_name', 'second_name', 'login', 'email', 'password', 'phone'];

function mapAuthFromStore(): Pick<RegisterPageProps, 'authError' | 'authLoading'> {
  const s = store.getState();
  return {
    authError: s.authError ?? undefined,
    authLoading: s.authLoading
  };
}

export default class RegisterPage extends Block<RegisterPageProps> {
  protected template = template;

  private _unsub: (() => void) | null = null;

  constructor(props: RegisterPageProps = {}) {
    super({ errors: {}, ...props, ...mapAuthFromStore() });
    this._unsub = store.subscribe(() => {
      this.setProps(mapAuthFromStore());
    });
  }

  protected componentWillUnmount(): void {
    this._unsub?.();
    this._unsub = null;
  }

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
      void AuthController.signUp({
        first_name: data.first_name,
        second_name: data.second_name,
        login: data.login,
        email: data.email,
        password: data.password,
        phone: data.phone
      });
    }
  };
}
