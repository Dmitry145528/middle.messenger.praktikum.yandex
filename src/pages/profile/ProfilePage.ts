import Block from '../../core/Block';
import template from './profile.hbs?raw';
import type { PasswordEditData, ProfileData, ProfileEditData } from './index';
import './profile.css';

type ProfilePageProps = ProfileData | ProfileEditData | PasswordEditData;

export default class ProfilePage extends Block<ProfilePageProps> {
  protected template = template;

  protected events = {
    submit: (event: SubmitEvent) => {
      event.preventDefault();

      const shouldRedirectToProfile = 'isEdit' in this.props || 'isPasswordEdit' in this.props;
      if (shouldRedirectToProfile) {
        window.location.href = '/profile';
      }
    }
  };
}

export type { ProfilePageProps };
