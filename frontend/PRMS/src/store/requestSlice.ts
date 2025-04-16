import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { Document } from './documentsSlice';
import { User, UserState } from '../types/userTypes';
import { RootState } from './store';

export interface PrintRequest {
  requestId?: string;
  user: Partial<User>;
  document: Partial<Document>;
  date?: string;
  instructions?: string;
  copies: number;
  color: boolean;
  paperType: string;
  inkUsage?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'APPROVED';
  urgency?: 'low' | 'medium' | 'high';
  statusHistory?: { status: string; timestamp: string }[];
}

interface PrintRequestState {
  requests: PrintRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: PrintRequestState = {
  requests: [],
  loading: false,
  error: null,
};

// Thunk to send a print request
export const sendPrintRequest = createAsyncThunk(
  'printRequest/sendPrintRequest',

  async (requestData: { copies: number; color: boolean; notes: string; paperType: any; document: Document }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;


    const printRequestPayload: PrintRequest = {
      document: requestData.document,
      user: {
        user_id: state.user?.user.userId ?? '',
        email: state.user.user.email,
      },
      copies: requestData.copies,
      color: requestData.color,
      instructions: requestData.notes,
      paperType: requestData.paperType,
    };

    console.log('P-request payload: ', printRequestPayload);
    try {
      const response: AxiosResponse<PrintRequest> = await axios.post(import.meta.env.VITE_SEND_PRINT_REQUEST_URL, printRequestPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('P-request response: ', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to fetch the list of print requests
export const fetchPrintRequests = createAsyncThunk(
  'printRequest/fetchPrintRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<PrintRequest[]> = await axios.get(import.meta.env.VITE_FETCH_PRINT_REQUESTS_URL, {
        //withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

     // console.log('Fetch print requests response: ', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to approve a print request
export const approvePrintRequest = createAsyncThunk(
  'printRequest/approvePrintRequest',
  async ({ userId, requestId }: { userId: string; requestId: string }, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<PrintRequest> = await axios.put(`${import.meta.env.VITE_APPROVE_PRINT_REQUEST_URL}`, {
        userId: userId,
        requestId: requestId,
        status: 'approved',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Approve print request response: ', response);
      return { status: response.status, message: response.data, };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const requestSlice = createSlice({
  name: 'printRequest',
  initialState,
  reducers: {
    addRequest: (state, action: PayloadAction<PrintRequest>) => {
      state.requests.push(action.payload);
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(request => request.requestId !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateRequestStatus: (state, action: PayloadAction<{ requestId: string; status: 'pending' | 'in-progress' | 'completed' | 'APPROVED' }>) => {
      console.log("update request status")
      const { requestId, status } = action.payload;
      console.log(requestId)
      console.log(state.requests)

      const request = state.requests.find(request => request.requestId === requestId);
      if (request) {
        request.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPrintRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPrintRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.push(action.payload);
      })
      .addCase(sendPrintRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPrintRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrintRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchPrintRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approvePrintRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePrintRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex(request => request.requestId === action.payload.request_id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(approvePrintRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addRequest, removeRequest, setLoading, setError, updateRequestStatus } = requestSlice.actions;

export default requestSlice.reducer;