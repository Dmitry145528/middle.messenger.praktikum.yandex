import Block from '../../core/Block';
import template from './chat.hbs?raw';
import type { ChatListItem, ChatMessage } from './chat-types';
import { validateField } from '../../utils/validation';
import store from '../../store/store';
import { mapUserToChatSidebar } from '../../utils/chatSidebarUser';
import { fetchAvatarBlob } from '../../utils/fetchAvatarBlob';
import { mapChatsToList, getActiveChatTitle } from '../../utils/mapChatsToList';
import ChatsController from '../../controllers/chats-controller';
import './chat.css';

interface ChatPageProps {
  sidebarUserName: string;
  sidebarUserAvatarRemote: string;
  chatList: ChatListItem[];
  messageList: ChatMessage[];
  activeChatTitle: string;
  chatsLoading: boolean;
  chatsError?: string;
}

function buildPropsFromState(): Omit<ChatPageProps, 'messageList'> {
  const s = store.getState();
  const sidebar = mapUserToChatSidebar(s.user);
  return {
    sidebarUserName: sidebar.sidebarUserName,
    sidebarUserAvatarRemote: sidebar.sidebarUserAvatarRemote,
    chatList: mapChatsToList(s.chats, s.user, s.selectedChatId),
    activeChatTitle: getActiveChatTitle(s.chats, s.selectedChatId),
    chatsLoading: s.chatsLoading,
    chatsError: s.chatsError ?? undefined
  };
}

export default class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  private _unsub: (() => void) | null = null;

  private _sidebarAvatarObjectUrl: string | null = null;

  private _sidebarAvatarSyncedForRemote: string | null = null;

  private _sidebarAvatarLoadGeneration = 0;

  private _prevChatsJSON = '';

  constructor() {
    const derived = buildPropsFromState();
    super({ ...derived, messageList: [] });

    void ChatsController.loadChats();

    this._unsub = store.subscribe(() => {
      const next = buildPropsFromState();
      const json = JSON.stringify(next);
      if (json === this._prevChatsJSON) {
        return;
      }
      this._prevChatsJSON = json;
      this.setProps(next as Partial<ChatPageProps>);
    });
  }

  private _revokeSidebarAvatarObjectUrl(): void {
    if (this._sidebarAvatarObjectUrl) {
      URL.revokeObjectURL(this._sidebarAvatarObjectUrl);
      this._sidebarAvatarObjectUrl = null;
    }
  }

  private _applySidebarAvatarToDOM(): void {
    const img = this.element()?.querySelector<HTMLImageElement>('.js-sidebar-avatar');
    if (!img) {
      return;
    }
    const src = this._sidebarAvatarObjectUrl ?? '';
    if (img.getAttribute('src') !== src) {
      img.src = src;
    }
    img.style.display = src ? '' : 'none';
  }

  private async _syncSidebarAvatar(remote: string): Promise<void> {
    if (!remote) {
      this._revokeSidebarAvatarObjectUrl();
      this._sidebarAvatarSyncedForRemote = null;
      this._applySidebarAvatarToDOM();
      return;
    }
    if (remote === this._sidebarAvatarSyncedForRemote) {
      this._applySidebarAvatarToDOM();
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
      this._applySidebarAvatarToDOM();
    } catch {
      if (generation !== this._sidebarAvatarLoadGeneration) {
        return;
      }
      this._sidebarAvatarSyncedForRemote = remote;
      this._revokeSidebarAvatarObjectUrl();
      this._applySidebarAvatarToDOM();
    }
  }

  protected events = {
    click: (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const chatRow = target.closest('[data-chat-id]');
      if (chatRow instanceof HTMLElement && chatRow.dataset.chatId) {
        const id = Number(chatRow.dataset.chatId);
        if (!Number.isNaN(id)) {
          ChatsController.selectChat(id);
        }
        return;
      }
      if (target.closest('.js-chat-add-user')) {
        event.preventDefault();
        const chatId = store.getState().selectedChatId;
        if (chatId == null) {
          window.alert('Выберите чат в списке слева.');
          return;
        }
        const raw = window.prompt('ID пользователя для добавления в чат:');
        if (raw == null || raw.trim() === '') {
          return;
        }
        const uid = Number(raw.trim());
        if (!Number.isInteger(uid) || uid < 1) {
          window.alert('Нужно целое положительное число.');
          return;
        }
        void ChatsController.addUsersToChat(chatId, [uid]);
        return;
      }
      if (target.closest('.js-chat-remove-user')) {
        event.preventDefault();
        const chatId = store.getState().selectedChatId;
        if (chatId == null) {
          window.alert('Выберите чат в списке слева.');
          return;
        }
        const raw = window.prompt('ID пользователя для удаления из чата:');
        if (raw == null || raw.trim() === '') {
          return;
        }
        const uid = Number(raw.trim());
        if (!Number.isInteger(uid) || uid < 1) {
          window.alert('Нужно целое положительное число.');
          return;
        }
        void ChatsController.removeUsersFromChat(chatId, [uid]);
      }
    },
    submit: (event: Event) => {
      const form = (event as SubmitEvent).target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (form.classList.contains('js-new-chat-form')) {
        event.preventDefault();
        const input = form.querySelector<HTMLInputElement>('input[name="title"]');
        const title = input?.value ?? '';
        void ChatsController.createChat(title).then(() => {
          if (input) {
            input.value = '';
          }
        });
        return;
      }

      if (!form.classList.contains('chat-message-form')) {
        return;
      }

      event.preventDefault();

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
