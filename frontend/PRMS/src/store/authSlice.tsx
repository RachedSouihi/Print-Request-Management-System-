import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SignUpFormData } from '../types/authentication';
import { encryptPassword } from '../features/encrypt';



// Interface utilisateur
interface User {
  id: string;  // Assure-toi que `id` est de type string ou le type approprié
  email: string;
  name: string;
  roles: string[];
}


// Interface de l'état d'authentification
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailVerificationStatus: boolean | null;
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


      


export const signUpUser = createAsyncThunk<boolean, { otp: string }, { rejectValue: string }>(
  'auth/signUp',
  async ({ otp }, { rejectWithValue }) => {
    try {
      const data = sessionStorage.getItem('signupData');
      if (!data) throw new Error("Données d'inscription manquantes");

      const user_data: SignUpFormData = JSON.parse(data);
      const post_data = {
        user: { ...user_data, password: "" },  // Retirer le rôle ici
        otp
      };

      const response = await axios.post('http://localhost:8081/user/signup', post_data, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa('admin:admin') }
      });

      return response.status === 200;
    } catch (error) {
      return rejectWithValue('Échec de l’inscription');
    }
  }
);


// Thunk pour la vérification de session
export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue('Session expirée, veuillez vous reconnecter.');
    }
  }
);

// Thunk pour l'envoi d'un email de vérification
export const sendVerifEmail = createAsyncThunk<boolean, { email: string; passwd: string; firstname: string }, { rejectValue: string }>(
  'auth/sendVerifEmail',
  async ({ email, passwd, firstname }, { rejectWithValue }) => {
    try {
      const password: string = await encryptPassword(JSON.stringify({ passwd, timestamp: Date.now() }));
      const response = await axios.post('http://localhost:8081/user/verify-email', { email, password, firstname }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa('admin:admin') }
      });

      return response.status === 200;
    } catch (error) {
      return rejectWithValue('Échec de la vérification de l’email');
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
      return rejectWithValue('Échec de la mise à jour du mot de passe');
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
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.token = localStorage.getItem('authState') ? JSON.parse(localStorage.getItem('authState')!).token : null;
      })
      .addCase(loginUser.rejected, (state, action) => { state.error = action.payload || 'Échec de connexion'; state.loading = false; })
      
      .addCase(signUpUser.pending, (state) => { state.loading = true; })
      .addCase(signUpUser.fulfilled, (state, action) => { state.isAuthenticated = action.payload; state.loading = false; })
      .addCase(signUpUser.rejected, (state, action) => { state.error = action.payload || 'Inscription échouée'; state.loading = false; })

      .addCase(checkAuth.pending, (state) => { state.loading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true; state.loading = false; })
      .addCase(checkAuth.rejected, (state, action) => { state.error = action.payload || 'Session expirée'; state.loading = false; })
      
      .addCase(sendVerifEmail.fulfilled, (state, action) => { state.emailVerificationStatus = action.payload; })
      .addCase(sendVerifEmail.rejected, (state, action) => { state.error = action.payload || 'Échec de la vérification de l’email'; })

      .addCase(updatePassword.fulfilled, (state) => { state.loading = false; })
      .addCase(updatePassword.rejected, (state, action) => { state.error = action.payload || 'Erreur lors de la mise à jour du mot de passe'; state.loading = false; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
