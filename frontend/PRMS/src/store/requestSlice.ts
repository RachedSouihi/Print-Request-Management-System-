import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { Document } from './documentsSlice';
import { User, UserState } from '../types/userTypes';
import { RootState } from './store';



export type StatusTypes = 'pending' | 'in-progress' | 'completed' | 'APPROVED' | 'REJECTED';
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
  status?: StatusTypes;
  urgency?: 'low' | 'medium' | 'high';
  statusHistory?: { status: StatusTypes; timestamp: string }[];
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

  async (requestData: { copies: number; color: boolean; notes: string; paperType: any; document: Partial<Document> }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    



    const printRequestPayload: PrintRequest = {
      document: requestData.document,
      user: {
        user_id: state.user?.user.user_id,
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

      console.log('P-request response from slice: ', response);
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
  async ({ userId, requestId, status }: { userId: string; requestId: string, status: StatusTypes }, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<PrintRequest> = await axios.put(`${import.meta.env.VITE_APPROVE_REJECT_PRINT_REQUEST_URL}`, {
        userId: userId,
        requestId: requestId,
        status: status,
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

export const approveRequests = createAsyncThunk<
  { status: number; message: string }, // Return type
  string[], // List of request IDs
  { rejectValue: { status: number; message: string } } // Rejected value type
>(
  'printRequest/approveRequests',
  async (requestIds, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APPROVE_REQUESTS_URL}`, // Replace with your API endpoint
        requestIds,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return { status: response.status, message: response.data.message };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({ status: error.response.status, message: error.response.data.message });
      }
      return rejectWithValue({ status: 500, message: 'An unknown error occurred' });
    }
  }
);

// Thunk to fetch prioritized print requests
export const getPrioritizedRequests = createAsyncThunk<
  PrintRequest[], // Return type
  void, // Argument type
  { rejectValue: string } // Rejected value type
>(
  'printRequest/getPrioritizedRequests',
  async (_, { rejectWithValue }) => {
    try {

      
      const response: AxiosResponse<PrintRequest[]> = await axios.get(
        `${import.meta.env.VITE_GET_PRIORITIZED_REQUESTS_URL}`, // Replace with your API endpoint
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Prioritized requests response:', response.data);
      return response.data; // Return the list of prioritized requests
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch prioritized requests');
      }
      return rejectWithValue('An unknown error occurred while fetching prioritized requests');
    }
  }
);

// Add new thunks
export const deletePrintRequest = createAsyncThunk(
  'printRequest/deletePrintRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${import.meta.env.VITE_DELETE_REQUEST_URL}/${requestId}`);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePrintRequest = createAsyncThunk(
  'printRequest/updatePrintRequest',
  async (requestData: PrintRequest, { rejectWithValue }) => {

    try {
      const response = await axios.put(
        import.meta.env.VITE_UPDATE_REQUEST_URL,
        requestData
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approveRejectRequests = createAsyncThunk<
  { status: number; message: string }, // Return type
  { requestIds: string[]; status: string }, // Argument type
  { rejectValue: { status: number; message: string } } // Rejected value type
>(
  'printRequest/approveRejectRequests',
  async ({ requestIds, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APPROVE_REQUESTS_URL}`, // Replace with your API endpoint
        { requestIds, status }, // Include both requestIds and status in the body
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return { status: response.status, message: response.data.message };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({ status: error.response.status, message: error.response.data.message });
      }
      return rejectWithValue({ status: 500, message: 'An unknown error occurred' });
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
    updateRequestStatus: (state, action: PayloadAction<{ requestId: string; status: StatusTypes; statusHistory?: { status: StatusTypes; timestamp: string } }>) => {
      const { requestId, status, statusHistory } = action.payload;

      const request = state.requests.find(request => request.requestId === requestId);
      if (request) {
        request.status = status;

        // Update the statusHistory
        request.statusHistory = [
          ...(request.statusHistory || []), // Preserve existing history
          ...(statusHistory ? [statusHistory] : []), // Add new history if provided
        ];
      }
    },
    clearRequests: (state) => {
      state.requests = []; // Clear the requests array
    }

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
      })
      .addCase(approvePrintRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getPrioritizedRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrioritizedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload; // Replace the current requests with prioritized requests
      })
      .addCase(getPrioritizedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePrintRequest.fulfilled, (state, action) => {

        console.log("Delete action: ", action);
        state.requests = state.requests.filter(
          request => request.requestId !== action.payload
        );
      })
      .addCase(updatePrintRequest.fulfilled, (state, action) => {

        console.log("Update action: ", action);
        const index = state.requests.findIndex(
          (r) => r.requestId == action.payload.requestId
        );

        if (index !== -1) {
          console.log("Updating request at index:", index, "with data:", action.payload);
          state.requests[index] = action.payload; // Replace the existing request with the updated one
        } else {
          console.log("Request not found in state:", action.payload.requestId);
        }
      })
      .addCase(approveRejectRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRejectRequests.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Approve/Reject requests response:', action.payload);
      })
      .addCase(approveRejectRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve/reject requests';
      });
      
  },
});

export const { addRequest, removeRequest, setLoading, setError, updateRequestStatus, clearRequests } = requestSlice.actions;

export default requestSlice.reducer;