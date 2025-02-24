import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserState } from '../types/userTypes';
import { encryptPassword } from '../features/encrypt';

// Function to load user profile from local storage
const loadUserProfile = (): UserState | null => {
  const userProfile = localStorage.getItem('userProfile');
  return userProfile ? JSON.parse(userProfile) : null;
};

const initialState: UserState = loadUserProfile() || {
  userId: '14414',
  firstName: 'Rached',
  lastName: 'Souihi',
  email: 'rached.souihi2613@istic.ucar.tn',
  phone: '20437408',
  educationLevel: 'Level 3',
  role: 'student',
};

// Async thunk for updating profile
export const updateProfileAsync = createAsyncThunk(
  'user/updateProfileAsync',
  async (userData: Partial<UserState>, { rejectWithValue }) => {
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
  async ({ email, oldPassword, newPassword }: { email: string, oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const encryptedOldPassword: string = await encryptPassword(oldPassword).then(res => res);
      const encryptedNewPassword: string = await encryptPassword(newPassword).then(res => res);

      const response = await axios.put(`${import.meta.env.VITE_UPDATE_PASSWORD_URL}`, {
        email,
        oldPassword: encryptedOldPassword,
        newPassword: encryptedNewPassword,
      },);
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateProfileAsync.fulfilled, (state, action: PayloadAction<{ status: number; message: any }>) => {
      const updatedState = { ...state, ...action.payload };
      localStorage.setItem('userProfile', JSON.stringify(updatedState));
      return updatedState;
    });
    builder.addCase(updatePasswordAsync.fulfilled, (state, action) => {
      // Handle successful password update
      return { ...state, ...action.payload };
    });
    builder.addCase(updatePasswordAsync.rejected, (state, action) => {
      // Handle password update error
    });
  },
});

export const { updateProfile } = userSlice.actions;
export default userSlice.reducer;