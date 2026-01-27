import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem } from "@/components/notifications/notification.utils";

type NotificationsState = {
  items: NotificationItem[];
};

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<NotificationItem>) {
      state.items.unshift(action.payload);
      if (state.items.length > 100) {
        state.items.pop();
      }
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllNotificationsRead(state) {
      state.items.forEach((item) => {
        item.isRead = true;
      });
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
