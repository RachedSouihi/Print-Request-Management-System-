import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { encryptPassword } from '../features/encrypt';
import { User } from '../types/userTypes';
import { RootState } from './store';
import { profile } from 'console';

// Function to load user profile from local storage
const loadUserProfile = async (): Promise<User | null> => {
  const userProfile = localStorage.getItem('authState');

    
    const user = userProfile ? JSON.parse(userProfile).user : null;
    const userId = '6ee9f2b6-a155-41ac-ab00-5e16509314cf'


    
    if (user === null || Object.keys(user).length === 0) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_FETCH_USER_PROFILE_URL}/${userId}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          }
        });

        localStorage.setItem("authState", JSON.stringify({user: response.data as User}));

        console.log("user info: " + response.data)
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    }
    return user;

};

interface UserState {
  user: User;
  users: User[];
}

const initialState: UserState = {
  user: await loadUserProfile() || {} as User,
  users: [], // Add users state
};

// Async thunk for updating profile
export const updateProfileAsync = createAsyncThunk(
  'user/updateProfileAsync',
  async (userData: Partial<User>, {getState,rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_UPDATE_PROFILE_URL}`,
        userData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });

      console.log("Update profile response: ", response)




      return { status: response.status, message: "Profile updated", user: response.data };

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

      const response = await axios.put(`${import.meta.env.VITE_UPDATE_PASSWORD_URL}`, {
        email: u_email,
        oldPassword: encryptedOldPassword,
        newPassword: encryptedNewPassword,
      }, {
        withCredentials: true,
       
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
      //state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileAsync.fulfilled, (state, action: PayloadAction<{ status: number; message: string; user: User }>) => {

        console.log("UPDATE USER ACTION PAYLOAD: ", action)
        state.user = action.payload.user

        localStorage.setItem("authState", JSON.stringify(action.payload));


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