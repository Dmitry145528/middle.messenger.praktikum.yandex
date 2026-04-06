import Block from '../../core/Block';
import Router from '../../core/Router';
import template from './profile.hbs?raw';
import type { PasswordEditData, ProfileData, ProfileEditData } from './profile-types';
import { validateField, validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import store from '../../store/store';
import AuthController from '../../controllers/auth-controller';
import { mapUserToProfileData } from '../../utils/mapUserToProfile';
import './profile.css';

type ProfilePageProps = (ProfileData | ProfileEditData | PasswordEditData) & {
  errors?: Record<string, string>;
};

const PROFILE_EDIT_FIELDS = ['email', 'login', 'first_name', 'second_name', 'display_name', 'phone'];
const PASSWORD_EDIT_FIELDS = ['oldPassword', 'newPassword', 'repeatPassword'];

function isViewMode(props: ProfilePageProps): boolean {
  return !('isEdit' in props && props.isEdit) && !('isPasswordEdit' in props && props.isPasswordEdit);
}

export default class ProfilePage extends Block<ProfilePageProps> {
  protected template = template;

  private handleFieldBlur = (): void => {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>('input[name]');
    const errors: Record<string, string> = { ...this.props.errors };
    const values: Record<string, string> = {};

    inputs.forEach((input) => {
      const name = input.name;
      const value = input.value;
      values[name] = value;

      const error = validateField(name, value);
      if (error) {
        errors[name] = error;
      } else {
        delete errors[name];
      }
    });

    this.setProps({ errors, ...values } as Partial<ProfilePageProps>);
  };

  private _storeUnsub: (() => void) | null = null;

  private _onLogoutClick = (event: Event): void => {
    event.preventDefault();
    void AuthController.logout();
  };

  constructor(props: ProfilePageProps) {
    super(props);
    if (isViewMode(props)) {
      this._storeUnsub = store.subscribe(() => {
        const u = store.getState().user;
        if (u) {
          this.setProps({ ...mapUserToProfileData(u), errors: {} } as Partial<ProfilePageProps>);
        }
      });
    }
  }

  protected events = {
    submit: (event: Event) => {
      event.preventDefault();
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      const form = target;

      const isEdit = 'isEdit' in this.props && this.props.isEdit;
      const isPasswordEdit = 'isPasswordEdit' in this.props && this.props.isPasswordEdit;

      const fields = isPasswordEdit ? PASSWORD_EDIT_FIELDS : isEdit ? PROFILE_EDIT_FIELDS : [];
      if (fields.length === 0) return;

      const { isValid, errors } = validateForm(form, fields);
      if (!isValid) {
        const data = collectFormData(form);
        this.setProps({ errors, ...(data as Record<string, string>) } as Partial<ProfilePageProps>);
        return;
      }

      const data = collectFormData(form);
      console.log('Данные формы профиля:', data);

      if (isEdit || isPasswordEdit) {
        Router.get().go('/settings');
      }
    }
  };

  protected componentDidMount(): void {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.addEventListener('blur', this.handleFieldBlur);
    });

    const logoutLink = root?.querySelector<HTMLAnchorElement>('.profile-page__actions a.link--error');
    logoutLink?.addEventListener('click', this._onLogoutClick);
  }

  protected componentWillUnmount(): void {
    this._storeUnsub?.();
    this._storeUnsub = null;

    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.removeEventListener('blur', this.handleFieldBlur);
    });

    const logoutLink = root?.querySelector<HTMLAnchorElement>('.profile-page__actions a.link--error');
    logoutLink?.removeEventListener('click', this._onLogoutClick);
  }
}

export type { ProfilePageProps };
