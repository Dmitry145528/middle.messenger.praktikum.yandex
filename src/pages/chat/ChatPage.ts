import Block from '../../core/Block';
import template from './chat.hbs?raw';
import type { ChatListItem, ChatMessage } from './chat-types';
import type { ChatUser } from '../../api/chats-api';
import { validateField } from '../../utils/validation';
import store from '../../store/store';
import { mapUserToChatSidebar } from '../../utils/chatSidebarUser';
import { fetchAvatarBlob } from '../../utils/fetchAvatarBlob';
import { resolveAvatarUrl } from '../../utils/avatarUrl';
import { mapChatsToList, getActiveChatTitle, getActiveChatAvatar } from '../../utils/mapChatsToList';
import { mapStoredChatMessagesToView } from '../../utils/mapStoredChatMessages';
import ChatsController from '../../controllers/chats-controller';
import ChatSocketController from '../../controllers/chat-socket-controller';
import { resourcesAPI } from '../../api/resources-api';
import { stickersAPI } from '../../api/stickers-api';
import './chat.css';

interface ChatUserView {
  id: number;
  name: string;
  avatar: string;
  isAdmin: boolean;
}

function mapChatUsers(users: ChatUser[]): ChatUserView[] {
  return users.map((u) => ({
    id: u.id,
    name: u.display_name?.trim() || `${u.first_name} ${u.second_name}`.trim() || u.login,
    avatar: resolveAvatarUrl(u.avatar),
    isAdmin: u.role === 'admin'
  }));
}

interface ChatPageProps {
  sidebarUserName: string;
  sidebarUserAvatarRemote: string;
  chatList: ChatListItem[];
  messageList: ChatMessage[];
  activeChatTitle: string;
  activeChatAvatar: string;
  chatUsersList: ChatUserView[];
  chatUsersCount: number;
  chatsLoading: boolean;
  chatsError?: string;
}

function buildPropsFromState(): ChatPageProps {
  const s = store.getState();
  const sidebar = mapUserToChatSidebar(s.user);
  const stored =
    s.selectedChatId != null ? s.chatMessagesByChatId[s.selectedChatId] : undefined;
  const messageList = mapStoredChatMessagesToView(stored, s.user?.id);
  return {
    sidebarUserName: sidebar.sidebarUserName,
    sidebarUserAvatarRemote: sidebar.sidebarUserAvatarRemote,
    chatList: mapChatsToList(s.chats, s.user, s.selectedChatId),
    activeChatTitle: getActiveChatTitle(s.chats, s.selectedChatId),
    activeChatAvatar: getActiveChatAvatar(s.chats, s.selectedChatId),
    chatUsersList: mapChatUsers(s.chatUsers),
    chatUsersCount: s.chatUsers.length,
    chatsLoading: s.chatsLoading,
    chatsError: s.chatsError ?? undefined,
    messageList
  };
}

export default class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  private _unsub: (() => void) | null = null;

  private _sidebarAvatarObjectUrl: string | null = null;

  private _sidebarAvatarSyncedForRemote: string | null = null;

  private _sidebarAvatarLoadGeneration = 0;

  private _prevChatsJSON = '';

  private _attachmentBlobs = new Set<string>();

  private _stickersGridFilled = false;

  constructor() {
    super(buildPropsFromState());

    void ChatsController.loadChats();

    this._unsub = store.subscribe(() => {
      const next = buildPropsFromState();
      const json = JSON.stringify(next);
      if (json === this._prevChatsJSON) {
        return;
      }
      this._prevChatsJSON = json;
      this.setProps(next);
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

  private _revokeAttachmentBlobs(): void {
    this._attachmentBlobs.forEach((u) => URL.revokeObjectURL(u));
    this._attachmentBlobs.clear();
  }

  private async _hydrateBlobUrls(selector: string): Promise<void> {
    const root = this.element();
    if (!root) {
      return;
    }
    const nodes = root.querySelectorAll<HTMLImageElement | HTMLVideoElement>(selector);
    await Promise.all(
      [...nodes].map(async (el) => {
        const remote = el.dataset.remote ?? '';
        if (!remote || el.dataset.blobReady === '1') {
          return;
        }
        el.dataset.blobReady = '1';
        try {
          const blob = await fetchAvatarBlob(remote);
          const u = URL.createObjectURL(blob);
          this._attachmentBlobs.add(u);
          el.src = u;
        } catch {
          el.removeAttribute('data-blobReady');
        }
      })
    );
  }

  private _triggerResourceUpload(accept: string): void {
    const chatId = store.getState().selectedChatId;
    if (chatId == null) {
      window.alert('Выберите чат в списке слева.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      void (async () => {
        try {
          const res = await resourcesAPI.upload(file);
          ChatSocketController.sendFileResourceId(String(res.id));
        } catch {
          window.alert('Не удалось загрузить файл.');
        }
      })();
    };
    input.click();
  }

  private async _openStickersPanel(): Promise<void> {
    const root = this.element();
    if (!root) {
      return;
    }
    const panel = root.querySelector<HTMLElement>('.js-stickers-panel');
    const grid = root.querySelector<HTMLElement>('.js-stickers-grid');
    if (!panel || !grid) {
      return;
    }
    panel.removeAttribute('hidden');
    panel.hidden = false;
    root.querySelectorAll<HTMLElement>('.js-dropdown-menu').forEach((m) => m.classList.remove('is-active'));
    if (this._stickersGridFilled) {
      await this._hydrateBlobUrls('.js-sticker-thumb[data-remote]');
      return;
    }
    try {
      const packs = await stickersAPI.getPacks();
      const packId = packs[0]?.id;
      if (packId == null) {
        window.alert('Нет доступных наборов стикеров.');
        return;
      }
      const stickers = await stickersAPI.getStickers(packId);
      grid.replaceChildren();
      for (const s of stickers) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-stickers-panel__item';
        btn.dataset.stickerId = String(s.id);
        const img = document.createElement('img');
        img.className = 'js-sticker-thumb';
        img.alt = '';
        img.dataset.remote = resolveAvatarUrl(s.path ?? '');
        btn.appendChild(img);
        grid.appendChild(btn);
      }
      this._stickersGridFilled = stickers.length > 0;
      await this._hydrateBlobUrls('.js-sticker-thumb[data-remote]');
    } catch {
      window.alert('Не удалось загрузить стикеры.');
    }
  }

  protected events = {
    click: (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const root = this.element();
      const stickerPick = target.closest<HTMLButtonElement>('.chat-stickers-panel__item[data-sticker-id]');
      if (stickerPick?.dataset.stickerId) {
        event.preventDefault();
        ChatSocketController.sendStickerId(stickerPick.dataset.stickerId);
        const spClose = root?.querySelector<HTMLElement>('.js-stickers-panel');
        if (spClose) spClose.hidden = true;
        return;
      }
      if (target.closest('.js-stickers-close')) {
        event.preventDefault();
        const sp = root?.querySelector<HTMLElement>('.js-stickers-panel');
        if (sp) sp.hidden = true;
        return;
      }
      if (target.closest('.js-open-stickers')) {
        event.preventDefault();
        void this._openStickersPanel();
        return;
      }
      if (target.closest('.js-attach-photo')) {
        event.preventDefault();
        this._triggerResourceUpload('image/*,video/*');
        return;
      }
      if (target.closest('.js-attach-file')) {
        event.preventDefault();
        this._triggerResourceUpload('*/*');
        return;
      }
      const chatRow = target.closest('[data-chat-id]');
      if (chatRow instanceof HTMLElement && chatRow.dataset.chatId) {
        const id = Number(chatRow.dataset.chatId);
        if (!Number.isNaN(id)) {
          const spanel = root?.querySelector<HTMLElement>('.js-stickers-panel');
          if (spanel) spanel.hidden = true;
          ChatsController.selectChat(id);
        }
        return;
      }
      const removeBtn = target.closest<HTMLElement>('.js-remove-member');
      if (removeBtn) {
        event.preventDefault();
        event.stopPropagation();
        const chatId = store.getState().selectedChatId;
        const userId = Number(removeBtn.dataset.userId);
        if (chatId != null && Number.isInteger(userId) && userId > 0) {
          void ChatsController.removeUsersFromChat(chatId, [userId]);
        }
        return;
      }
      if (target.closest('.js-members-toggle')) {
        event.stopPropagation();
        const dropdown = this.element()?.querySelector('.js-members-dropdown');
        dropdown?.classList.toggle('is-active');
        return;
      }
      if (target.closest('.js-chat-avatar')) {
        event.preventDefault();
        const chatId = store.getState().selectedChatId;
        if (chatId == null) {
          window.alert('Выберите чат в списке слева.');
          return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/gif,image/webp';
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            void ChatsController.uploadChatAvatar(chatId, file);
          }
        };
        input.click();
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
      if (target.closest('.js-chat-delete')) {
        event.preventDefault();
        const chatId = store.getState().selectedChatId;
        if (chatId == null) {
          window.alert('Выберите чат в списке слева.');
          return;
        }
        if (window.confirm('Удалить этот чат?')) {
          void ChatsController.deleteChat(chatId);
        }
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

      ChatSocketController.sendMessage(message.trim());

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

    root.querySelector('.js-members-dropdown')?.classList.remove('is-active');
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
    this._revokeAttachmentBlobs();
    ChatSocketController.start();
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

    void this._hydrateBlobUrls(
      'img.js-message-attachment[data-remote], video.js-message-attachment[data-remote]'
    );
  }

  protected componentWillUnmount(): void {
    this._revokeAttachmentBlobs();
    ChatSocketController.stop();
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
