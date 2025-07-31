import { config } from '@/config';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const SOCKET_API_URL = config.baseUrl || 'http://localhost:5000';

console.log('🔧 Socket URL:', SOCKET_API_URL);

interface ServerToClientEvents {
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
  message: (data: { sender: { id: number; name: string }; content: string; chatId: number }) => void;
  messagesRemoved: (data: { messageIds: number[] }) => void;
  clearChat: (status: boolean) => void;
  newChat: (data: { chatId: number; chat: any; participants: any[] }) => void;
  chatUpdated: (data: { chatId: number; lastMessage: any; unreadCounts: any[] }) => void;
  chatRead: (data: { chatId: number; userId: number }) => void;
  newNotification: (data: any) => void;
  unreadCountUpdate: (data: { count: number }) => void;
}

interface ClientToServerEvents {
  joinChat: (
    data: { chatId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
  leaveChat: (
    data: { chatId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
  joinUserRoom: (
    data: { userId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
  leaveUserRoom: (
    data: { userId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_API_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: true,
  forceNew: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.warn('🔌 Disconnected:', reason);
});

export const socketEmitter = <TResponse>(
  event: keyof ClientToServerEvents,
  data?: unknown
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      return reject(new Error('Socket not connected'));
    }

    socket.emit(event as any, data, (response: any) => {
      if (response?.error) {
        return reject(new Error(response.error.message));
      }
      resolve(response as TResponse);
    });
  });
};

// === Chat Room Management ===

export const joinChat = (chatId: number) => socketEmitter<{ success: boolean; message: string }>('joinChat', { chatId });
export const leaveChat = (chatId: number) => socketEmitter<{ success: boolean; message: string }>('leaveChat', { chatId });

// === Message Events ===

export const listenForMessages = (cb: ServerToClientEvents['message']) => socket.on('message', cb);
export const removeMessageListener = (cb: ServerToClientEvents['message']) => socket.off('message', cb);

export const listenForMessagesRemoved = (cb: ServerToClientEvents['messagesRemoved']) => socket.on('messagesRemoved', cb);
export const removeMessagesRemovedListener = (cb: ServerToClientEvents['messagesRemoved']) => socket.off('messagesRemoved', cb);

export const listenForClearChat = (cb: ServerToClientEvents['clearChat']) => socket.on('clearChat', cb);
export const removeClearChatListener = (cb: ServerToClientEvents['clearChat']) => socket.off('clearChat', cb);

// === Chat Lifecycle ===

export const listenForNewChat = (cb: ServerToClientEvents['newChat']) => socket.on('newChat', cb);
export const removeNewChatListener = (cb: ServerToClientEvents['newChat']) => socket.off('newChat', cb);

export const listenForChatUpdated = (cb: ServerToClientEvents['chatUpdated']) => socket.on('chatUpdated', cb);
export const removeChatUpdatedListener = (cb: ServerToClientEvents['chatUpdated']) => socket.off('chatUpdated', cb);

export const listenForChatRead = (cb: ServerToClientEvents['chatRead']) => socket.on('chatRead', cb);
export const removeChatReadListener = (cb: ServerToClientEvents['chatRead']) => socket.off('chatRead', cb);

// === Notifications ===

export const listenForNewNotification = (cb: ServerToClientEvents['newNotification']) => socket.on('newNotification', cb);
export const removeNewNotificationListener = (cb: ServerToClientEvents['newNotification']) => socket.off('newNotification', cb);

export const listenForUnreadCountUpdate = (cb: ServerToClientEvents['unreadCountUpdate']) => socket.on('unreadCountUpdate', cb);
export const removeUnreadCountUpdateListener = (cb: ServerToClientEvents['unreadCountUpdate']) => socket.off('unreadCountUpdate', cb);

// === User Room (Notifications) ===

export const joinUserRoom = (userId: number) =>
  socketEmitter<{ success: boolean; message: string }>('joinUserRoom', { userId });

export const leaveUserRoom = (userId: number) =>
  socketEmitter<{ success: boolean; message: string }>('leaveUserRoom', { userId });

export default socket;
