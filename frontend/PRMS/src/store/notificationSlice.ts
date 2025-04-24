import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'; // Adjust the import path based on your project structure



export type NotificationType = 'assignment' | 'announcement' | 'grade';

// Define the Notification type
export interface Notification {
  notif_id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Define the initial state
interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

// Thunk for fetching notifications
export const fetchNotifications = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'notifications/fetchNotifications',
  async (_, {getState ,rejectWithValue }) => {
    try {

        const state = getState() as RootState;

        const user_id =  state.user?.user.userId ?? '';

      const response = await fetch(`${import.meta.env.VITE_FETCH_NOTIFICATIONS_URL}/${user_id}`); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data: Notification[] = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.notif_id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload); // Add the new notification to the list
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      });
  },
});

// Export actions and reducer
export const { markAsRead, addNotification } = notificationSlice.actions;
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectLoading = (state: RootState) => state.notifications.loading;
export const selectError = (state: RootState) => state.notifications.error;

export default notificationSlice.reducer;