import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { encryptPassword } from '../features/encrypt';
import { User } from '../types/userTypes';
import { RootState } from './store';

// Function to load user profile from local storage
const loadUserProfile = (): User | null => {
  const userProfile = localStorage.getItem('userProfile');
  return userProfile ? JSON.parse(userProfile) : null;
};

interface UserState {
  user: User;
  users: User[];
}

const initialState: UserState = {
  user: loadUserProfile() || {
    userId: '67890',
    email: 'rached.souihi2613@istic.ucar.tn',
    active: true,
    profile: {
      firstName: 'Rached',
      lastName: 'Souihi',
      phone: '20437408',
      educationLevel: 'Level 3',
      role: 'student',
    },
  },
  users: [], // Add users state
};

// Async thunk for updating profile
export const updateProfileAsync = createAsyncThunk(
  'user/updateProfileAsync',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_UPDATE_PROFILE_URL}`,
        userData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });

      return { status: response.status, message: response.data, };

    } catch (error: Error | any) {
      if (axios.isAxiosError(error) && error.response) {
        if ([401].includes(error.response.status)) {
          return rejectWithValue({ status: error.response.status, message: error.response.data });
        }
      }
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for updating password
export const updatePasswordAsync = createAsyncThunk(
  'user/updatePasswordAsync',
  async ({ email, oldPassword, newPassword }: { email: string, oldPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
    try {
      const encryptedOldPassword: string = await encryptPassword(oldPassword).then(res => res);
      const encryptedNewPassword: string = await encryptPassword(newPassword).then(res => res);

      const state = getState() as RootState;
      const u_email = state.user.user.email;

      console.log({ email, oldPassword, newPassword });
      const response = await axios.put(`${import.meta.env.VITE_UPDATE_PASSWORD_URL}`, {
        email: u_email,
        oldPassword: encryptedOldPassword,
        newPassword: encryptedNewPassword,
      });
      return { status: response.status, message: response.data, };
    } catch (error: Error | any) {
      if (axios.isAxiosError(error) && error.response) {
        if ([400, 404, 500].includes(error.response.status)) {
          return rejectWithValue({ status: error.response.status, message: error.response.data });
        }
      }
      return rejectWithValue({ status: 500, message: 'Try again (server error)' });
    }
  }
);

// Async thunk for fetching all users
export const fetchAllUsersAsync = createAsyncThunk(
  'user/fetchAllUsersAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_FETCH_ALL_USERS_URL}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });

      return response.data;
    } catch (error: Error | any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({ status: error.response.status, message: error.response.data });
      }
      return rejectWithValue({ status: 500, message: 'Try again (server error)' });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileAsync.fulfilled, (state, action: PayloadAction<{ status: number; message: any }>) => {
        const updatedState = { ...state.user, ...action.payload };
        localStorage.setItem('userProfile', JSON.stringify(updatedState));
        state.user = updatedState;
      })
      .addCase(updatePasswordAsync.fulfilled, (state, action) => {
        // Handle successful password update
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updatePasswordAsync.rejected, (state, action) => {
        // Handle password update error
      })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => {
        // Handle successful fetch of all users
        state.users = action.payload;
      })
      .addCase(fetchAllUsersAsync.rejected, (state, action) => {
        // Handle fetch all users error
      });
  },
});

export const { updateProfile } = userSlice.actions;
export default userSlice.reducer;