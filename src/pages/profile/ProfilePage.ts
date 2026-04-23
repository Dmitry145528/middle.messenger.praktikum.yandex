import Block from '../../core/Block';
import template from './profile.hbs?raw';
import type { PasswordEditData, ProfileData, ProfileEditData } from './profile-types';
import { validateField, validateForm } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import store from '../../store/store';
import AuthController from '../../controllers/auth-controller';
import UserController from '../../controllers/user-controller';
import { mapUserToProfileData } from '../../utils/mapUserToProfile';
import { fetchAvatarBlob } from '../../utils/fetchAvatarBlob';
import './profile.css';

type ProfilePageProps = (ProfileData | ProfileEditData | PasswordEditData) & {
  errors?: Record<string, string>;
  profileError?: string;
  profileLoading?: boolean;
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

  private _avatarObjectUrl: string | null = null;

  private _avatarSyncedForRemote: string | null = null;

  private _avatarLoadGeneration = 0;

  private _onLogoutClick = (event: Event): void => {
    event.preventDefault();
    void AuthController.logout();
  };

  private _onAvatarChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.files?.length) return;
    const file = target.files[0];
    void UserController.updateAvatar(file).then(() => {
      target.value = '';
      const u = store.getState().user;
      if (u) {
        this.setProps({ avatar: mapUserToProfileData(u).avatar } as Partial<ProfilePageProps>);
      }
    });
  };

  private _revokeAvatarObjectUrl(): void {
    if (this._avatarObjectUrl) {
      URL.revokeObjectURL(this._avatarObjectUrl);
      this._avatarObjectUrl = null;
    }
  }

  private _applyAvatarToDOM(): void {
    const root = this.element();
    if (!root) {
      return;
    }
    const img = root.querySelector<HTMLImageElement>('.js-avatar-image');
    const placeholder = root.querySelector<HTMLImageElement>('.js-avatar-placeholder');
    const src = this._avatarObjectUrl ?? '';
    if (img) {
      if (img.getAttribute('src') !== src) {
        img.src = src;
      }
      img.style.display = src ? '' : 'none';
    }
    if (placeholder) {
      placeholder.style.display = src ? 'none' : '';
    }
  }

  private async _syncAvatarDisplayIfNeeded(): Promise<void> {
    const remote = typeof this.props.avatar === 'string' ? this.props.avatar : '';
    if (!remote) {
      this._revokeAvatarObjectUrl();
      this._avatarSyncedForRemote = null;
      this._applyAvatarToDOM();
      return;
    }
    if (remote === this._avatarSyncedForRemote) {
      this._applyAvatarToDOM();
      return;
    }

    const generation = ++this._avatarLoadGeneration;
    try {
      const blob = await fetchAvatarBlob(remote);
      if (generation !== this._avatarLoadGeneration) {
        return;
      }
      this._revokeAvatarObjectUrl();
      this._avatarObjectUrl = URL.createObjectURL(blob);
      this._avatarSyncedForRemote = remote;
      this._applyAvatarToDOM();
    } catch {
      if (generation !== this._avatarLoadGeneration) {
        return;
      }
      this._avatarSyncedForRemote = remote;
      this._revokeAvatarObjectUrl();
      this._applyAvatarToDOM();
    }
  }

  constructor(props: ProfilePageProps) {
    const s = store.getState();
    super({
      ...props,
      profileError: s.profileError ?? undefined,
      profileLoading: s.profileLoading
    });

    this._storeUnsub = store.subscribe(() => {
      const state = store.getState();
      const u = state.user;

      if ('isPasswordEdit' in this.props && this.props.isPasswordEdit) {
        this.setProps({
          profileError: state.profileError ?? undefined,
          profileLoading: state.profileLoading
        } as Partial<ProfilePageProps>);
        return;
      }

      if ('isEdit' in this.props && this.props.isEdit) {
        this.setProps({
          profileError: state.profileError ?? undefined,
          profileLoading: state.profileLoading
        } as Partial<ProfilePageProps>);
        return;
      }

      if (isViewMode(this.props) && u) {
        this.setProps({ ...mapUserToProfileData(u), errors: {} } as Partial<ProfilePageProps>);
      }
    });
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

      const data = collectFormData(form) as Record<string, string>;

      if (isEdit) {
        void UserController.updateProfile({
          first_name: data.first_name,
          second_name: data.second_name,
          display_name: data.display_name,
          login: data.login,
          email: data.email,
          phone: data.phone
        });
        return;
      }

      if (isPasswordEdit) {
        void UserController.updatePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        });
      }
    }
  };

  protected componentDidMount(): void {
    void this._syncAvatarDisplayIfNeeded();

    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.addEventListener('blur', this.handleFieldBlur);
    });

    const logoutLink = root?.querySelector<HTMLAnchorElement>('.profile-page__actions a.link--error');
    logoutLink?.addEventListener('click', this._onLogoutClick);

    if ('isEdit' in this.props && this.props.isEdit) {
      root?.querySelector<HTMLInputElement>('.avatar__input')?.addEventListener('change', this._onAvatarChange);
    }
  }

  protected componentWillUnmount(): void {
    this._avatarLoadGeneration += 1;
    this._revokeAvatarObjectUrl();
    this._avatarSyncedForRemote = null;

    this._storeUnsub?.();
    this._storeUnsub = null;

    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.profile-page__form');
    form?.querySelectorAll<HTMLInputElement>('input[data-validate]').forEach((input) => {
      input.removeEventListener('blur', this.handleFieldBlur);
    });

    const logoutLink = root?.querySelector<HTMLAnchorElement>('.profile-page__actions a.link--error');
    logoutLink?.removeEventListener('click', this._onLogoutClick);

    root?.querySelector<HTMLInputElement>('.avatar__input')?.removeEventListener('change', this._onAvatarChange);
  }
}
