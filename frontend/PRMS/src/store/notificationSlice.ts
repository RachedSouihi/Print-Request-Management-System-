import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'; // Adjust the import path based on your project structure
import axios from 'axios';



export type NotificationType = 'assignment' | 'announcement' | 'grade' | 'COURSE_ANNOUNCEMENT';

// Define the Notification type
export interface Notification {
  notifId: string;
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

        const user_id =  state.user?.user.user_id ?? '';

      const response = await fetch(`${import.meta.env.VITE_FETCH_NOTIFICATIONS_URL}/${user_id}`); 

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

export const markNotificationAsRead = createAsyncThunk<
  string, // Return type (notification ID)
  string, // Argument type (notification ID)
  { rejectValue: string } // Rejected value type
>(
  'notifications/markAsRead',
  async (notif_id, { rejectWithValue }) => {
    console.log('Marking notification as read:', notif_id); // Debugging line
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_MARK_NOTIFICATION_READ_URL}/${notif_id}`, // API endpoint
        {}, // Empty body for PUT request
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to mark notification as read');
      }

      return notif_id; // Return the notification ID
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to mark notification as read');
      }
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
  void, // Return type (no return value needed)
  void, // Argument type (no arguments needed)
  { rejectValue: string } // Rejected value type
>(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const user_id = state.user?.user.user_id; // Get the user_id from the state

      if (!user_id) {
        throw new Error('User ID is missing');
      }

      const response = await axios.put(
        `${import.meta.env.VITE_MARK_ALL_NOTIFICATIONS_READ_URL}/${user_id}`, // API endpoint
        {}, // Empty body for PUT request
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to mark all notifications as read');
      }
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.notifId === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload); // Add the new notification to the list
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
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notif = state.notifications.find((n) => n.notifId === action.payload);
        if (notif) {
          notif.read = true; // Mark the notification as read
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark notification as read';
      })
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach((notif) => {
          notif.read = true; // Mark all notifications as read
        });
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      });
  },
});

// Export actions and reducer
export const { markAsRead, addNotification } = notificationSlice.actions;
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectLoading = (state: RootState) => state.notifications.loading;
export const selectError = (state: RootState) => state.notifications.error;

export default notificationSlice.reducer;