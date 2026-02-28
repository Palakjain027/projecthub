import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  setConnected: (connected: boolean) => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, _get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length
  }),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
  })),

  markAsRead: (notificationId) => set((state) => {
    const updatedNotifications = state.notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    return {
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.isRead).length
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  removeNotification: (notificationId) => set((state) => {
    const notification = state.notifications.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.isRead;
    return {
      notifications: state.notifications.filter((n) => n.id !== notificationId),
      unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
    };
  }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  setConnected: (connected) => set({ isConnected: connected }),

  updateUnreadCount: () => set((state) => ({
    unreadCount: state.notifications.filter(n => !n.isRead).length
  })),
}));

// Selector hooks
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useIsSocketConnected = () => useNotificationStore((state) => state.isConnected);
