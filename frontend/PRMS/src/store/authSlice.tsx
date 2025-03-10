import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SignUpFormData } from '../types/authentication';
import { encryptOTP, encryptPassword } from '../features/encrypt';
import { User, UserState } from '../types/userTypes';


// Interface de l'état d'authentification
interface AuthState {
  user: UserState | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailVerificationStatus: boolean | null;
  apiCallResult?: boolean;
  token: string | null;
}

// Chargement de l'état initial depuis localStorage
const loadState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('authState');
    return serializedState ? JSON.parse(serializedState) : {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      emailVerificationStatus: null,
      token: null,
    };
  } catch (err) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      emailVerificationStatus: null,
      token: null,
    };
  }
};

// Sauvegarde de l'état dans localStorage
const saveState = (state: AuthState) => {
  try {
    localStorage.setItem('authState', JSON.stringify(state));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde de l’état', err);
  }
};

// Suppression du token et état utilisateur
const clearAuthState = () => {
  try {
    localStorage.removeItem('authState');
  } catch (err) {
    console.error('Erreur lors de la suppression de l’état', err);
  }
};

// État initial
const initialState: AuthState = loadState();

// Thunk pour la connexion
export const loginUser = createAsyncThunk<
  User,  // Type de retour attendu pour une réponse réussie
  { email: string; password: string },  // Paramètres d'entrée
  { rejectValue: string }  // Type de la valeur rejetée
>(
// Async thunk for login
export const loginUser = createAsyncThunk<UserState, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Envoi de la requête GET pour la connexion
      const response = await axios.get(
        `http://127.0.0.1:8081/auth/login?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // Si ton backend utilise des cookies
        }
      );

      console.log("Réponse serveur :", response);

      // Extraction du token brut
      const rawToken = response.data.access_token;
      const extractedToken = rawToken.match(/access_token=([^,]*)/)?.[1] || rawToken;
       // Extrait le token

      if (!extractedToken) {
        console.error("Échec de l'extraction du token :", rawToken);
        return rejectWithValue("Échec de connexion. Token invalide.");
      }
    
      // Sauvegarder le token directement dans le localStorage
      localStorage.setItem("token", extractedToken);

      // Décodage du JWT pour obtenir l'utilisateur
      const parseJwt = (token: string) => {
        try {
          const base64Url = token.split('.')[1]; // Partie encodée du payload
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(atob(base64)); // Décodage en JSON
        } catch (error) {
          console.error("Erreur lors du décodage du token :", error);
          return {}; // Retourne un objet vide en cas d'erreur
        }
      };

      const decodedToken = parseJwt(extractedToken);
      console.log("Token décodé :", decodedToken);

      if (!decodedToken.sub || !decodedToken.email) {
        console.error("Erreur : Impossible de décoder le token ou les informations sont invalides.");
        return rejectWithValue("Échec de connexion. Token invalide.");
      }

      // Création de l'utilisateur à partir du token décodé
      const user: User = {
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name || '',
        roles: decodedToken.realm_access?.roles || [], // Définit des rôles vides si non présents
      };

      // Sauvegarde dans le state
      saveState({ 
        ...initialState, 
        user: user, 
        isAuthenticated: true, 
        token: extractedToken 
      });

      console.log("Utilisateur authentifié :", user);
      return user; // Renvoie l'utilisateur si la connexion est réussie

    } catch (error) {
      console.error("Erreur de connexion :", error);
      return rejectWithValue('Échec de connexion. Vérifiez vos informations.'); // Retourne une erreur si la connexion échoue
    }
  }
);

// Async thunk for sign-up
export const signUpUser = createAsyncThunk<{ status: number; message: string; user?: User }, { otp: string }, { rejectValue: { status: number; message: string } }>(
  'auth/signUp',
  async ({ otp }, { rejectWithValue }) => {
    try {

      const encryptedOTP: string = await encryptOTP(otp)
      const data = sessionStorage.getItem('signupData');
      if (!data) throw new Error("Données d'inscription manquantes");

      const user_data: SignUpFormData = JSON.parse(data);
      const post_data = {
        user: {
          email: email,
          password: "",
          profile: {
            ...profile,
            role: "student"
          }
        },
        otp: encryptedOTP
      };

      console.log("POST DATA: " + post_data.user.profile)

      const response = await axios.post(
        import.meta.env.VITE_SIGN_UP_URL,
        post_data,
        {
          withCredentials: true, // Allow cookies
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_USERNAME}:${import.meta.env.VITE_API_PASSWORD}`)
          }
        }
      );

      console.log("response: ", response)
      if (response.status === 200) {
        return { status: response.status, message: 'Sign-up successful', user: response.data as User };
      } else {
        throw new Error('Sign-up failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && [401, 403].includes(error.response.status)) {
        return rejectWithValue({ status: error.response.status, message: error.response.data });
      }
      if (error instanceof Error) {
        return rejectWithValue({ status: 500, message: error.message });
      }
      return rejectWithValue({ status: 500, message: 'An unknown error occurred' });
    }
  }
);


// Thunk pour la vérification de session
export const checkAuth = createAsyncThunk<UserState, void, { rejectValue: string }>(
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

export const testAPICall = createAsyncThunk<string, void, { rejectValue: string }>(
  '/testAPICall',
  async (_, { rejectWithValue }) => {
    try {
      // Pass an empty object as data payload and the config as third argument.
      const response = await axios.get(
        import.meta.env.VITE_TEST_API_PATH,
        {}, // Empty data payload if not needed
      
      );

      console.log("Response from api test call is:", response);

      if (response.status === 200) {
        return "auth";
      } else {
        return rejectWithValue("API call failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        return "unauthorized user";
      }
      return rejectWithValue("API call failed");
    }
  }
);

// Thunk pour l'envoi d'un email de vérification
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
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_USERNAME}:${import.meta.env.VITE_API_PASSWORD}`)
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

// Async thunk for resending verification email
export const resendVerifEmail = createAsyncThunk<boolean, { email: string; firstname: string }, { rejectValue: string }>(
  'auth/resendVerifEmail',
  async ({ email, firstname }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_RESEND_VERIF_EMAIL_URL,
        { email, firstname },
        {
          withCredentials: true, // Allow cookies
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_USERNAME}:${import.meta.env.VITE_API_PASSWORD}`)
          }
        }
      );

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Resend verification email failed:", error);
      return rejectWithValue("Resend verification email failed");
    }
  }
);

// Thunk pour la mise à jour du mot de passe
export const updatePassword = createAsyncThunk<boolean, { email: string; newPassword: string }, { rejectValue: string }>(
  'auth/updatePassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put('http://localhost:8081/update-password', { email, newPassword }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa('admin:admin') }
      });

      return response.status === 200 && response.data === "Password updated successfully";
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

// Slice Redux
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      clearAuthState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserState>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        saveState(state); // Save state to localStorage on login
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Login failed';
        state.loading = false;
      })
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<{ status: number; message: string; user?: User }>) => {
        if (action.payload.status === 200) {
          if (action.payload.user) {
            state.user = { user: action.payload.user, profile: action.payload.user.profile };
          }
          state.isAuthenticated = true;
        }
        state.loading = false;
        saveState(state); // Save state to localStorage on sign-up
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Sign-up failed';
        state.loading = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<UserState>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        saveState(state); // Save state to localStorage on auth check
      })
      .addCase(checkAuth.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Authentication check failed';
        state.loading = false;
      })
      .addCase(sendVerifEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerifEmail.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.emailVerificationStatus = action.payload;
        state.loading = false;
      })
      .addCase(sendVerifEmail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Email verification failed';
        state.loading = false;
      })
      .addCase(testAPICall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testAPICall.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.apiCallResult = action.payload;
        state.loading = false;
      })
      .addCase(testAPICall.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'API call failed';
        state.loading = false;
      })
      .addCase(resendVerifEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerifEmail.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.emailVerificationStatus = action.payload;
        state.loading = false;
      })
      .addCase(resendVerifEmail.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Resend verification email failed';
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
