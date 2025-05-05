import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserState } from '../types/userTypes';
import { RootState } from '../store/store';

export interface Subject {
  subject_id: string;
  name: string;
}

export interface Field {
  field_id: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  level: number;
  subject?: Subject;
  field?: Field;
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
  subjects: Subject[];
  fields: Field[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  savedDocuments: [],
  subjects: [],
  fields: [],
  loading: false,
  error: null,
};

// Thunk to fetch documents
export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (_, { getState, rejectWithValue }) => {
  try {

    const state = getState() as RootState;

    const user_id = state.user?.user.user_id;

    const response = await axios.get(`${import.meta.env.VITE_GET_DOCUMENTS_URL}?user_id=${user_id}`); // Replace with your API endpoint

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
    const userId = state.user.user.user_id;



    const now: Date = new Date();
    const date_milliseconds: number = now.getTime();

    console.log('userId', userId);
    console.log('documentId', documentId);



    try {
      const response = await axios.post(import.meta.env.VITE_SAVE_DOCUMENT_URL, { userId, documentId, date_milliseconds });

      console.log('Save document response:', response); // Log the response data
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && [401, 403, 404, 500].includes(error.response.status)) {
        return rejectWithValue(error.response.data);
      }
      else if (axios.isAxiosError(error) && error.response) {
        // Return a custom error message from the server response
        return rejectWithValue(error.response.data.message);
      } else {
        // Return a generic error message
        return rejectWithValue('Failed to save document');
      }
    }
  }
);

export const trackDocumentClickThunk = createAsyncThunk(
  'documents/trackDocumentClick',
  async (documentId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.user_id;

    try {
      const response = await axios.post(import.meta.env.VITE_TRACK_DOC_CLICK_URL, { userId, documentId });

      return {
        status: response.status,
        message: response.data.message,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Return a custom error message from the server response
        return rejectWithValue(error.response.data.message);
      } else {
        // Return a generic error message
        return rejectWithValue('Failed to track document click');
      }
    }
  }
);

export const fetchSubjectsThunk = createAsyncThunk<
  { status: number; subjects: Subject[] }, // Return type
  void, // Argument type
  { rejectValue: string } // Rejected value type
>(
  'documents/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(import.meta.env.VITE_GET_SUBJECTS_URL); // Replace with your API endpoint
      return { status: response.status, subjects: response.data };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Failed to fetch subjects');
    }
  }
);

export const fetchFieldsThunk = createAsyncThunk<
  { status: number; fields: string[] }, // Return type
  void, // Argument type
  { rejectValue: string } // Rejected value type
>(
  'documents/fetchFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(import.meta.env.VITE_GET_FIELDS_URL);
      return { status: response.status, fields: response.data };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Failed to fetch fields');
    }
  }
);

export const fetchSavedDocumentsThunk = createAsyncThunk<
  Document[], // Return type
  void, // Argument type
  { rejectValue: string } // Rejected value type
>(
  'documents/fetchSavedDocuments',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user?.user.user_id; // Get the user ID from the Redux state

    console.log('userId', userId); // Log the user ID

    try {
      const response = await axios.get(`${import.meta.env.VITE_GET_SAVED_DOCUMENTS_URL}`, {
        params: { userId: '9c912fa9-998f-4c02-a6aa-d9397fa21b89' }, // Send userId as a query parameter
      });

      console.log('Fetched saved documents:', response); // Log the fetched data
      return response.data; // Return the list of saved documents
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Failed to fetch saved documents');
    }
  }
);

export const downloadDocumentThunk = createAsyncThunk<
{ blob: Blob; documentId: string } , // Return type: object with Blob & ID  string, // Argument type (document ID)
string,
  { rejectValue: string } // Rejected value type
>(
  'documents/downloadDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_DOWNLOAD_DOC_URL}`, {
        params: { id: documentId }, // Send document ID as a query parameter
        responseType: 'blob', // Set response type to 'blob' for file download
      });

      console.log('Download document response:', response); // Log the response
      

      return { blob: response.data, documentId }; // Return both Blob and ID


    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to download document');
      }
      return rejectWithValue('An unknown error occurred while downloading the document');
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
    },


  
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = [...state.documents, ...action.payload];
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
      })
      .addCase(saveDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to save document';
        console.error('Error saving document:', state.error);
      })
      .addCase(fetchSubjectsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload.subjects;
      })
      .addCase(fetchSubjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch subjects';
        console.error('Error fetching subjects:', state.error);
      })
      .addCase(fetchFieldsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFieldsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields; // Assuming you add `fields` to the state
      })
      .addCase(fetchFieldsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch fields';
        console.error('Error fetching fields:', state.error);
      })
      .addCase(fetchSavedDocumentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.savedDocuments = action.payload; // Update the savedDocuments state with the fetched data
      })
      .addCase(fetchSavedDocumentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch saved documents';
        console.error('Error fetching saved documents:', state.error);
      })
      .addCase(downloadDocumentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadDocumentThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Document downloaded successfully');



        // Find the downloaded document in the state and increment its downloads count
        const downloadedDocument = state.savedDocuments.find(doc => doc.id === action.meta.arg);
        if (downloadedDocument) {

          console.log('Document found:', downloadedDocument);
          downloadedDocument.downloads += 1; // Increment the downloads count
        }else{
          console.log('Document not found in state:', action.meta.arg);
        }
      })
      .addCase(downloadDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to download document';
        console.error('Error downloading document:', state.error);
      });
  },
});

export const { saveDocument, removeSavedDocument,  } = documentsSlice.actions;

export default documentsSlice.reducer;