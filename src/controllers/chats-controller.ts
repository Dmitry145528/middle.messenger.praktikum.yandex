import { chatsAPI } from '../api/chats-api';
import store from '../store/store';
import { getApiErrorMessage } from '../utils/apiErrorMessage';

const ChatsController = {
  selectChat(chatId: number): void {
    store.patch({ selectedChatId: chatId });
  },

  async loadChats(title?: string): Promise<void> {
    store.patch({ chatsLoading: true, chatsError: null });
    try {
      const chats = await chatsAPI.getList(title ? { title } : undefined);
      let selectedChatId = store.getState().selectedChatId;
      if (chats.length) {
        if (selectedChatId == null || !chats.some((c) => c.id === selectedChatId)) {
          selectedChatId = chats[0].id;
        }
      } else {
        selectedChatId = null;
      }
      store.patch({
        chats,
        chatsLoading: false,
        chatsError: null,
        selectedChatId
      });
    } catch (e) {
      store.patch({
        chatsLoading: false,
        chatsError: getApiErrorMessage(e)
      });
    }
  },

  async createChat(title: string): Promise<void> {
    const t = title.trim();
    if (!t) {
      return;
    }
    store.patch({ chatsLoading: true, chatsError: null });
    try {
      const { id } = await chatsAPI.create(t);
      store.patch({ selectedChatId: id });
      await ChatsController.loadChats();
    } catch (e) {
      store.patch({
        chatsLoading: false,
        chatsError: getApiErrorMessage(e)
      });
    }
  },

  async addUsersToChat(chatId: number, userIds: number[]): Promise<void> {
    if (!userIds.length) {
      return;
    }
    store.patch({ chatsLoading: true, chatsError: null });
    try {
      await chatsAPI.addUsers({ chatId, users: userIds });
      await ChatsController.loadChats();
    } catch (e) {
      store.patch({
        chatsLoading: false,
        chatsError: getApiErrorMessage(e)
      });
    }
  },

  async removeUsersFromChat(chatId: number, userIds: number[]): Promise<void> {
    if (!userIds.length) {
      return;
    }
    store.patch({ chatsLoading: true, chatsError: null });
    try {
      await chatsAPI.removeUsers({ chatId, users: userIds });
      await ChatsController.loadChats();
    } catch (e) {
      store.patch({
        chatsLoading: false,
        chatsError: getApiErrorMessage(e)
      });
    }
  }
};

export default ChatsController;
