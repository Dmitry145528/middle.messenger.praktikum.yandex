import Block from '../../core/Block';
import template from './login.hbs?raw';
import { validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import store from '../../store/store';
import AuthController from '../../controllers/auth-controller';
import './login.css';

interface LoginPageProps {
  errors?: Record<string, string>;
  values?: Record<string, string>;
  authError?: string;
  authLoading?: boolean;
}

const LOGIN_FIELDS = ['login', 'password'];

function mapAuthFromStore(): Pick<LoginPageProps, 'authError' | 'authLoading'> {
  const s = store.getState();
  return {
    authError: s.authError ?? undefined,
    authLoading: s.authLoading === true
  };
}

export default class LoginPage extends Block<LoginPageProps> {
  protected template = template;

  private _unsub: (() => void) | null = null;

  constructor(props: LoginPageProps = {}) {
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

      const { isValid, errors } = validateForm(form, LOGIN_FIELDS);
      if (!isValid) {
        const data = collectFormData(form) as Record<string, string>;
        this.setProps({ errors, values: data });
        return;
      }

      const data = collectFormData(form) as Record<string, string>;
      void AuthController.signIn({
        login: data.login,
        password: data.password
      });
    }
  };
}
