import profilePage from './profile.hbs?raw';
import './profile.css';
import ProfilePage from './ProfilePage';
import type { ProfileData, ProfileEditData, PasswordEditData } from './profile-types';

const profileData: ProfileData = {
	avatar: '',
	first_name: 'Иван',
	second_name: 'Иванов',
	display_name: 'Иван',
	login: 'ivanivanov',
	email: 'pochta@yandex.ru',
	phone: '+7 (909) 967 30 30'
};

const profileEditData: ProfileEditData = {
	...profileData,
	isEdit: true
};

const passwordEditData: PasswordEditData = {
	...profileData,
	isPasswordEdit: true
};

export { profilePage, profileData, profileEditData, passwordEditData, ProfilePage };
export type { ProfileData, ProfileEditData, PasswordEditData } from './profile-types';
