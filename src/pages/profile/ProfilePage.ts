import Block from '../../core/Block';
import template from './profile.hbs?raw';
import type { PasswordEditData, ProfileData, ProfileEditData } from './index';
import { validateField, validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import './profile.css';

type ProfilePageProps = (ProfileData | ProfileEditData | PasswordEditData) & {
  errors?: Record<string, string>;
};

const PROFILE_EDIT_FIELDS = ['email', 'login', 'first_name', 'second_name', 'display_name', 'phone'];
const PASSWORD_EDIT_FIELDS = ['oldPassword', 'newPassword', 'repeatPassword'];

export default class ProfilePage extends Block<ProfilePageProps> {
  protected template = template;

  private handleFieldBlur = (): void => {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>('input[name]');
    const errors: Record<string, string> = { ...this.props.errors };

    inputs.forEach((input) => {
      const name = input.name;
      const error = validateField(name, input.value);
      if (error) {
        errors[name] = error;
      } else {
        delete errors[name];
      }
    });

    this.setProps({ errors } as Partial<ProfilePageProps>);
  };

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

      const data = collectFormData(form);
      console.log('Данные формы профиля:', data);

      const { isValid, errors } = validateForm(form, fields);
      if (!isValid) {
        this.setProps({ errors } as Partial<ProfilePageProps>);
        return;
      }

      if (isEdit || isPasswordEdit) {
        setTimeout(() => { window.location.href = '/profile'; }, 5000);
      }
    }
  };

  protected componentDidMount(): void {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.addEventListener('blur', this.handleFieldBlur);
    });
  }

  protected componentWillUnmount(): void {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.removeEventListener('blur', this.handleFieldBlur);
    });
  }
}

export type { ProfilePageProps };
