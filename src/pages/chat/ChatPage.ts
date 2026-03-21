import Block from '../../core/Block';
import template from './chat.hbs?raw';
import type { ChatListItem, ChatMessage } from './index';
import { validateField } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import './chat.css';

interface ChatPageProps {
  chatList: ChatListItem[];
  messageList: ChatMessage[];
}

export default class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  protected events = {
    submit: (event: Event) => {
      const form = (event as SubmitEvent).target;
      if (!(form instanceof HTMLFormElement) || !form.classList.contains('chat-message-form')) {
        return;
      }

      event.preventDefault();

      const data = collectFormData(form);
      console.log('Данные формы сообщения:', data);

      const messageInput = form.querySelector<HTMLInputElement>('input[name="message"]');
      const errorEl = form.querySelector<HTMLSpanElement>('.js-message-error');
      const message = messageInput?.value ?? '';
      const error = validateField('message', message);

      if (errorEl) errorEl.textContent = error ?? '';
      messageInput?.classList.toggle('chat-message-form__input--error', Boolean(error));

      if (error) return;

      if (messageInput) {
        messageInput.value = '';
      }
    }
  };

  private handleToggleClick = (event: Event): void => {
    event.stopPropagation();

    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const root = this.element();
    if (!root) {
      return;
    }

    const parent = target.closest<HTMLElement>('.chat-options, .chat-attach');
    const menu = parent?.querySelector<HTMLElement>('.js-dropdown-menu');

    root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach(dropdown => {
      if (dropdown !== menu) {
        dropdown.classList.remove('is-active');
      }
    });

    menu?.classList.toggle('is-active');
  };

  private handleDocumentClick = (): void => {
    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach(menu => {
      menu.classList.remove('is-active');
    });
  };

  private handleMessageBlur = (): void => {
    const root = this.element();
    const form = root?.querySelector<HTMLFormElement>('.chat-message-form');
    const messageInput = form?.querySelector<HTMLInputElement>('input[name="message"]');
    const errorEl = form?.querySelector<HTMLSpanElement>('.js-message-error');
    if (!messageInput || !errorEl) return;

    const error = validateField('message', messageInput.value);
    errorEl.textContent = error ?? '';
    messageInput.classList.toggle('chat-message-form__input--error', Boolean(error));
  };

  protected componentDidMount(): void {
    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle').forEach(button => {
      button.addEventListener('click', this.handleToggleClick);
    });

    document.addEventListener('click', this.handleDocumentClick);

    const messageInput = root.querySelector<HTMLInputElement>('.chat-message-form__input');
    messageInput?.addEventListener('blur', this.handleMessageBlur);
  }

  protected componentWillUnmount(): void {
    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle').forEach(button => {
      button.removeEventListener('click', this.handleToggleClick);
    });

    document.removeEventListener('click', this.handleDocumentClick);

    const messageInput = root.querySelector<HTMLInputElement>('.chat-message-form__input');
    messageInput?.removeEventListener('blur', this.handleMessageBlur);
  }
}

export type { ChatPageProps };
