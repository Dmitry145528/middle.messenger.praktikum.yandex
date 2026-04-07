import Block from '../../core/Block';
import template from './chat.hbs?raw';
import type { ChatListItem, ChatMessage } from './index';
import { validateField } from '../../utils/validation';
import { collectFormData } from '../../utils/formData';
import store from '../../store/store';
import type { ChatSidebarUserProps } from '../../utils/chatSidebarUser';
import { mapUserToChatSidebar } from '../../utils/chatSidebarUser';
import { fetchAvatarBlob } from '../../utils/fetchAvatarBlob';
import './chat.css';

interface ChatPageProps extends ChatSidebarUserProps {
  chatList: ChatListItem[];
  messageList: ChatMessage[];
}

export default class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  private _unsub: (() => void) | null = null;

  private _sidebarAvatarObjectUrl: string | null = null;

  private _sidebarAvatarSyncedForRemote: string | null = null;

  private _sidebarAvatarLoadGeneration = 0;

  constructor(props: ChatPageProps) {
    super(props);
    this._unsub = store.subscribe(() => {
      const base = mapUserToChatSidebar(store.getState().user);
      this.setProps({
        sidebarUserName: base.sidebarUserName,
        sidebarUserAvatarRemote: base.sidebarUserAvatarRemote
      });
    });
  }

  private _revokeSidebarAvatarObjectUrl(): void {
    if (this._sidebarAvatarObjectUrl) {
      URL.revokeObjectURL(this._sidebarAvatarObjectUrl);
      this._sidebarAvatarObjectUrl = null;
    }
  }

  private async _syncSidebarAvatar(remote: string): Promise<void> {
    if (!remote) {
      this._revokeSidebarAvatarObjectUrl();
      this._sidebarAvatarSyncedForRemote = null;
      if (this.props.sidebarUserAvatar) {
        this.setProps({ sidebarUserAvatar: '' });
      }
      return;
    }
    if (remote === this._sidebarAvatarSyncedForRemote) {
      return;
    }

    const generation = ++this._sidebarAvatarLoadGeneration;
    try {
      const blob = await fetchAvatarBlob(remote);
      if (generation !== this._sidebarAvatarLoadGeneration) {
        return;
      }
      this._revokeSidebarAvatarObjectUrl();
      this._sidebarAvatarObjectUrl = URL.createObjectURL(blob);
      this._sidebarAvatarSyncedForRemote = remote;
      this.setProps({ sidebarUserAvatar: this._sidebarAvatarObjectUrl });
    } catch {
      if (generation !== this._sidebarAvatarLoadGeneration) {
        return;
      }
      this._sidebarAvatarSyncedForRemote = remote;
      this._revokeSidebarAvatarObjectUrl();
      this.setProps({ sidebarUserAvatar: '' });
    }
  }

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

    root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach((dropdown) => {
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

    root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach((menu) => {
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
    void this._syncSidebarAvatar(this.props.sidebarUserAvatarRemote);

    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle').forEach((button) => {
      button.addEventListener('click', this.handleToggleClick);
    });

    document.removeEventListener('click', this.handleDocumentClick);
    document.addEventListener('click', this.handleDocumentClick);

    const messageInput = root.querySelector<HTMLInputElement>('.chat-message-form__input');
    messageInput?.addEventListener('blur', this.handleMessageBlur);
  }

  protected componentWillUnmount(): void {
    this._sidebarAvatarLoadGeneration += 1;
    this._revokeSidebarAvatarObjectUrl();
    this._sidebarAvatarSyncedForRemote = null;

    this._unsub?.();
    this._unsub = null;

    const root = this.element();
    if (!root) {
      return;
    }

    root.querySelectorAll<HTMLButtonElement>('.js-dropdown-toggle').forEach((button) => {
      button.removeEventListener('click', this.handleToggleClick);
    });

    document.removeEventListener('click', this.handleDocumentClick);

    const messageInput = root.querySelector<HTMLInputElement>('.chat-message-form__input');
    messageInput?.removeEventListener('blur', this.handleMessageBlur);
  }
}

export type { ChatPageProps };
