import Block from '../../core/Block';
import template from './chat.hbs?raw';
import type { ChatListItem, ChatMessage } from './index';
import './chat.css';

interface ChatPageProps {
  chatList: ChatListItem[];
  messageList: ChatMessage[];
}

export default class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  protected events = {
    submit: (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.classList.contains('chat-message-form')) {
        return;
      }

      event.preventDefault();
      const input = form.querySelector<HTMLInputElement>('.chat-message-form__input');
      if (input) {
        input.value = '';
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

  protected componentDidMount(): void {
    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle').forEach(button => {
      button.addEventListener('click', this.handleToggleClick);
    });

    document.addEventListener('click', this.handleDocumentClick);
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
  }
}

export type { ChatPageProps };
