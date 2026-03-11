import profilePage from './profile.hbs?raw';
import './profile.css';

const profileData = {
	avatar: '',
	first_name: 'Иван',
	second_name: 'Иванов',
	display_name: 'Иван',
	login: 'ivanivanov',
	email: 'pochta@yandex.ru',
	phone: '+7 (909) 967 30 30'
};

const profileEditData = {
	...profileData,
	isEdit: true
};

const passwordEditData = {
	...profileData,
	isPasswordEdit: true
};

export { profilePage, profileData, profileEditData, passwordEditData };
