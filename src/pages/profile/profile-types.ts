export interface ProfileData {
  avatar: string;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

export type ProfileEditData = ProfileData & { isEdit: true };

export type PasswordEditData = ProfileData & { isPasswordEdit: true };
