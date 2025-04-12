import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Interface pour les données envoyées
interface ProfRequestData {
  level: string;
  section: string;
  subject: string;
  class: string;
  docType: string;
  examDate?: string;
  printMode: string;
  description:string;

  //specialInstructions?: string;
  file: File | null;
}

// Thunk pour envoyer les données à l'API
export const addDocument = createAsyncThunk(
  "documents/addDocument",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8082/documents/add", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
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
