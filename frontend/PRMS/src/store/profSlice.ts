import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store";

// Interface pour les données envoyées
interface ProfRequestData {
  level: string;
  section: string;
  subject: string;
  class: string;
  docType: string;
  examDate?: string;
  printMode: string;
  description: string;
  file: File | null;
}

// Thunk pour envoyer les données à l'API
export const addDocument = createAsyncThunk(
  "documents/addDocument",
  async (formData: FormData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;



      const user_id =  state.user?.user.user_id;


      formData.append("user_id", user_id); // Ajout de l'ID utilisateur au FormData

      console.log("Form data before sending: ", formData)

      const description = formData.get('description') as string | null;
      formData.append('title', description || '');

      // Utilisation de l'URL depuis les variables d'environnement
      const url = import.meta.env.VITE_ADD_DOCUMENT_URL;

      // Requête POST avec Axios
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      console.log("Add document response: ", response)

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An unknown error occurred"
      );
    }
  }
);

// Slice Redux
const profSlice = createSlice({
  name: "prof",
  initialState: {
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addDocument.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(addDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setStatus, setError } = profSlice.actions;
export default profSlice.reducer;
