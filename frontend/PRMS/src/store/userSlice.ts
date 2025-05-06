import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { encryptPassword } from '../features/encrypt';
import { User } from '../types/userTypes';
import { RootState } from './store';
import { profile } from 'console';

// Define a type guard for User
const isUser = (obj: any): obj is User => {
  return obj && typeof obj === 'object' && 'userId' in obj && 'email' in obj; // Add more checks as needed
};

// Function to load user profile from local storage
const loadUserProfile = async (): Promise<User | null> => {
  const userProfile = localStorage.getItem('authState');

  console.log("userprofile: ", userProfile);

  let user: User | null = null;

  if (userProfile) {
    try {
      const parsedProfile = JSON.parse(userProfile).user;

      console.log("parsedProfile: ", parsedProfile)
      //if (isUser(parsedProfile)) {

        user = parsedProfile;

        console.log("parsed user: ", user)
      //} else {
        console.warn("Invalid user profile format in local storage.");
      //}
    } catch (error) {
      console.error("Error parsing user profile:", error);
    }
  }

  if (!user) {
    const user_id = '9c912fa9-998f-4c02-a6aa-d9397fa21b89';

    try {
      const response = await axios.get(`${import.meta.env.VITE_FETCH_USER_PROFILE_URL}/${user_id}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      user = response.data as User;

      console.log("Fetched user: ", user);
      localStorage.setItem("authState", JSON.stringify({ user }));
      console.log("Fetched user info: ", response.data);
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

  async (userData: Partial<User>, {rejectWithValue }) => {
    try {
      console.log('user updated info: ', userData)

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

// Async thunk for adding a new user
export const addUserAsync = createAsyncThunk<
  { status: number; message: string; user: User }, // Return type
  User, // Argument type
  { rejectValue: { status: number; message: string } } // Rejected value type
>(
  'user/addUserAsync',
  async (newUser: User, { rejectWithValue }) => {
    try {
      console.log('Adding new user: ', newUser);

      const response = await axios.post(
        `${import.meta.env.VITE_API_ADD_USER_URL}`,
        {"user": newUser},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Add user response: ', response);

      return { status: response.status, message: 'User added successfully', user: response.data };
    } catch (error: Error | any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({ status: error.response.status, message: error.response.data });
      }
      return rejectWithValue({ status: 500, message: 'An unknown error occurred' });
    }
  }
);

// Async thunk for updating a user
export const updateUserAsync = createAsyncThunk<
  { status: number; message: string; user: User }, // Return type
  User, // Argument type
  { rejectValue: { status: number; message: string } } // Rejected value type
>(
  'user/updateUserAsync',
  async (updatedUser: User, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_UPDATE_USER_URL}/${updatedUser.user_id}`, // Replace with your API endpoint
        
        updatedUser,
        
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return { status: response.status, message: 'User updated successfully', user: response.data };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({ status: error.response.status, message: error.response.data });
      }
      return rejectWithValue({ status: 500, message: 'An unknown error occurred' });
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
        console.log('UPDATE USER ACTION PAYLOAD: ', action);
        state.user = action.payload.user;

        localStorage.setItem('authState', JSON.stringify(action.payload));
      })
      .addCase(addUserAsync.fulfilled, (state, action: PayloadAction<{ status: number; message: string; user: User }>) => {
        console.log('ADD USER ACTION PAYLOAD: ', action);
        state.users.push(action.payload.user); // Add the new user to the users array
      })
      .addCase(addUserAsync.rejected, (state, action) => {
        console.error('Failed to add user: ', action.payload?.message);
      })
      .addCase(updatePasswordAsync.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {

        console.log('UPDATE USER ACTION PAYLOAD: ', action);
        const index = state.users.findIndex(user => user.user_id === action.payload.user.user_id);
        if (index !== -1) {
          state.users[index] = action.payload.user; // Update the user in the state
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        console.error('Failed to update user:', action.payload?.message);
      });
  },
});

export const { updateProfile } = userSlice.actions;
export default userSlice.reducer;