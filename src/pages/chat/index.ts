import chatPage from './chat.hbs?raw';
import './chat.css';

const chatList = [
	{ name: 'Вадим', time: 'Пт', message: 'Круто!', isMe: true, unreadCount: 0, isActive: true },
	{ name: 'Илья', time: '15:12', message: 'Друзья, у меня для вас особенный выпуск новостей!...', isMe: false, unreadCount: 4, isActive: false },
	{ name: 'Киноклуб', time: '12:00', message: 'стикер', isMe: true, unreadCount: 0, isActive: false },
	{ name: 'Дизайн', time: 'Пн', message: 'Как насчет созвона?', isMe: false, unreadCount: 1, isActive: false },
];

const messageList = [
	{
		text: 'Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем, что астронавты летали с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны, так как астронавты с собой забрали только кассеты с пленкой.<br><br>Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.',
		time: '11:56',
		type: 'incoming'
	},
	{
		text: 'Круто!',
		time: '12:00',
		type: 'outgoing',
		isRead: true
	}
];

export { chatPage, chatList, messageList };