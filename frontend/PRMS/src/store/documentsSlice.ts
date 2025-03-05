import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserState } from '../types/userTypes';
import { RootState } from '../store/store';

export interface Document {
  id: string;
  title: string;
  level: number;
  subject: string;
  field: string;
  description?: string;
  docType: 'serie' | 'exam';
  user?: Partial<UserState>;
  date: string;
  downloads: number;
  fileUrl: string;
  rating: number;
}

interface DocumentsState {
  documents: Document[];
  savedDocuments: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  savedDocuments: [],
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

// Thunk to save a document
export const saveDocumentThunk = createAsyncThunk(
  'documents/saveDocument',
  async (documentId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user_id;

    console.log({ userId, documentId })

    try {
      const response = await axios.post(import.meta.env.VITE_SAVE_DOCUMENT_URL, { userId, documentId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Return a custom error message from the server response
        return rejectWithValue(error.response.data.message);
      } else {
        // Return a generic error message
        return rejectWithValue('Failed to save document');
      }
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    saveDocument: (state, action: PayloadAction<Document>) => {
      state.savedDocuments.push(action.payload);
    },
    removeSavedDocument: (state, action: PayloadAction<string>) => {
      state.savedDocuments = state.savedDocuments.filter(doc => doc.id !== action.payload);
    }
  },
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
      })
      .addCase(saveDocumentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDocumentThunk.fulfilled, (state, action) => {
        state.loading = false;
        //state.savedDocuments.push(action.payload);
      })
      .addCase(saveDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to save document';
        console.error('Error saving document:', state.error);
      });
  },
});

export const { saveDocument, removeSavedDocument } = documentsSlice.actions;

export default documentsSlice.reducer;