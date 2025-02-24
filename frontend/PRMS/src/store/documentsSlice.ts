import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserState } from '../types/userTypes';

interface Document {
  id: string;
  file: string;
  subject: string;
  description: string;
  docType: 'serie' | 'exam';
  user: Partial<UserState>;
}

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
};

// Thunk to fetch documents
export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(import.meta.env.VITE_GET_DOCUMENTS_URL);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Return a custom error message from the server response
      return rejectWithValue(error.response.data.message);
    } else {
      // Return a generic error message
      return rejectWithValue('Failed to fetch documents');
    }
  }
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch documents';
        console.error('Error fetching documents:', state.error);
      });
  },
});

export default documentsSlice.reducer;