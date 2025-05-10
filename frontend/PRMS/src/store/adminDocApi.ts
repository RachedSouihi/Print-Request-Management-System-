import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Définition des types pour Document et l'état du slice
export interface Document {
  id: string;
  title: string;
  type: 'Administrative' | 'Educational';
  visibility: 'For all professors' | 'For admin only';
  message: string;
  file: string; // <- ATTENTION ici c'est 'file' attendu, pas 'document'
  date: string;
  author: string;
  fileType: string | null;  // <- fileType peut être null dans ton backend
}

interface AdminDocState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadSuccess: boolean;
}

const initialState: AdminDocState = {
  documents: [],
  loading: false,
  error: null,
  uploadSuccess: false,
};

const BASE_URL = 'http://localhost:8082/doc';

// Action pour uploader un document
export const uploadDocument = createAsyncThunk<
  Document,
  { title: string; type: 'Administrative' | 'Educational'; visibility: 'For all professors' | 'For admin only'; message: string; file: File },
  { rejectValue: string }
>(
  'admindoc/uploadDocument',
  async ({ title, type, visibility, message, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('visibility', visibility);
      formData.append('message', message);
      formData.append('file', file);

      const response = await axios.post(`${BASE_URL}/admindoc/upload`, formData);
      console.log('Réponse du serveur:', response);

      // Adapter la réponse backend au type attendu
      const uploadedDoc = {
        ...response.data,
        file: response.data.document,
      };
      delete uploadedDoc.document;

      return uploadedDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

// Action pour récupérer la liste des documents
export const fetchDocuments = createAsyncThunk<
  Document[],
  void,
  { rejectValue: string }
>(
  'admindoc/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/by-type-with-file`);

      // Log la réponse pour vérifier les données retournées
      console.log('Réponse de récupération des documents:', response);

      // Vérifier si des documents sont renvoyés
      if (response.data && Array.isArray(response.data)) {
        console.log('Documents récupérés:', response.data);
      } else {
        console.error('Erreur: Les documents n\'ont pas été renvoyés sous la forme d\'un tableau.');
      }

      const fixedData: Document[] = response.data.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        visibility: doc.visibility,
        message: doc.message,
        file: doc.document || '',   // <- corrige le champ
        date: doc.date,
        author: doc.author,
        fileType: doc.fileType ?? null,  // <- sécurise fileType
      }));

      // Log des documents après avoir corrigé les données
      console.log('Documents après transformation:', fixedData);

      return fixedData;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des documents:', error);
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

export const fetchDocumentsForAdmin = createAsyncThunk<
  Document[],
  void,
  { rejectValue: string }
>(
  'admindoc/fetchDocumentsForAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/for-admins`);
      console.log('Documents For Admin:', response);

      const fixedData: Document[] = response.data.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        visibility: doc.visibility,
        message: doc.message,
        file: doc.document || '',   // <- corrige le champ
        date: doc.date,
        author: doc.author,
        fileType: doc.fileType ?? null,
      }));

      return fixedData;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des documents pour admin:', error);
      return rejectWithValue(error.response?.data || error.message || 'An unknown error occurred');
    }
  }
);

// Action pour supprimer un document
export const deleteDocument = createAsyncThunk<
  string, // Retourne l'ID du document supprimé
  string, // Paramètre: l'ID du document à supprimer
  { rejectValue: string }
>(
  'admindoc/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/admindoc/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to delete document');
    }
  }
);

// Action pour mettre à jour un document
export const updateDocument = createAsyncThunk<
  Document,
  { id: string; updates: Partial<Document> },
  { rejectValue: string }
>(
  'admindoc/updateDocument',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/admindoc/${id}`, updates);
      
      // Adapte la réponse comme pour les autres endpoints
      const updatedDoc = {
        ...response.data,
        file: response.data.document || '',
      };
      delete updatedDoc.document;
      
      return updatedDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to update document');
    }
  }
);

// Slice
const adminDocSlice = createSlice({
  name: 'admindoc',
  initialState,
  reducers: {
    clearUploadStatus: (state) => {
      state.uploadSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<Document[]>) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch documents';
      })
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action: PayloadAction<Document>) => {
        state.loading = false;
        state.uploadSuccess = true;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upload document';
      })
      .addCase(fetchDocumentsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentsForAdmin.fulfilled, (state, action: PayloadAction<Document[]>) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocumentsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch documents for admin';
      })
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete document';
      })
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action: PayloadAction<Document>) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update document';
      });
  }
});

export const { clearUploadStatus } = adminDocSlice.actions;
export default adminDocSlice.reducer;