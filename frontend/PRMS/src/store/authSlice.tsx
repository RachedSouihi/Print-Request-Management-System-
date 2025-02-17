import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SignUpFormData } from '../types/authentication';
import { encryptPassword } from '../features/encrypt';

// Define the shape of the state
interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  // Add other user properties as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailVerificationStatus: boolean | null;
}

// Load initial state from localStorage
const loadState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        emailVerificationStatus: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      emailVerificationStatus: null,
    };
  }
};

// Save state to localStorage
const saveState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

// Initial state
const initialState: AuthState = loadState();

// Async thunk for login
export const loginUser = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data.user; // { id, name, email, etc. }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for sign-up
export const signUpUser = createAsyncThunk<boolean, { otp: string }, { rejectValue: string }>(
  'auth/signUp',
  async ({ otp }, { rejectWithValue }) => {
    try {
      const data = sessionStorage.getItem('signupData');
      if (!data) {
        throw new Error("No sign-up data found in session storage");
      }
      const user_data: SignUpFormData = JSON.parse(data);

      const { email, ...profile } = user_data;

      const post_data = {
        user: {
          email: email,
          password: "",
          profile: {
            ...profile,
            role: "student"
          }
        },
        otp
      };

      const response = await axios.post(
        import.meta.env.VITE_SIGN_UP_URL,
        post_data,
        {
          withCredentials: true, // Allow cookies
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }
      );

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        return false; // Return false for 401 error
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for checking auth status
export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for email verification
export const sendVerifEmail = createAsyncThunk<boolean, { email: string; passwd: string; firstname: string }, { rejectValue: string }>(
  'auth/sendVerifEmail',
  async ({ email, passwd, firstname }, { rejectWithValue }) => {
    try {
      const timestamp = new Date().getTime();
      const password: string = await encryptPassword(JSON.stringify({ passwd, timestamp }));

      const response = await axios.post(
        import.meta.env.VITE_VERIF_EMAIL_URL,
        { email, password, firstname },
        {
          withCredentials: true, // Allow cookies
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin')
          }
        }
      );

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Email verification failed:", error);
      return rejectWithValue("Email verification failed");
    }
  }
);

export const verifyAuth = createAsyncThunk<boolean, number, { rejectValue: string }>(
  'auth/verifyAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://127.0.0.1:/user/auth/is-signed-in');
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {

      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        return false;
      }
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      saveState(state); // Save state to localStorage on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        //state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        //state.loading = false;
        saveState(state); // Save state to localStorage on login
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Login failed';
        //state.loading = false;
      })
      .addCase(signUpUser.pending, (state) => {
        //state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<boolean>) => {
        //state.loading = false;
        if (action.payload) {
          // Handle successful sign-up
          // Only update the necessary parts of the state
          state.isAuthenticated = true;
        } else {
          state.error = 'Invalid OTP';
        }
      })
      .addCase(signUpUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Sign-up failed';
        //state.loading = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        //state.loading = false;
        saveState(state); // Save state to localStorage on auth check
      })
      .addCase(checkAuth.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Authentication check failed';
        //state.loading = false;
      })
      .addCase(sendVerifEmail.pending, (state) => {
       // state.loading = true;
        state.error = null;
      })
      .addCase(sendVerifEmail.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.emailVerificationStatus = action.payload;
        //state.loading = false;
      })
      .addCase(sendVerifEmail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Email verification failed';
        //state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;