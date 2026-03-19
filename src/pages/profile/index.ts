import profilePage from './profile.hbs?raw';
import './profile.css';

interface ProfileData {
	avatar: string;
	first_name: string;
	second_name: string;
	display_name: string;
	login: string;
	email: string;
	phone: string;
}

type ProfileEditData = ProfileData & { isEdit: true };
type PasswordEditData = ProfileData & { isPasswordEdit: true };

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

export { profilePage, profileData, profileEditData, passwordEditData };
export type { ProfileData, ProfileEditData, PasswordEditData };
