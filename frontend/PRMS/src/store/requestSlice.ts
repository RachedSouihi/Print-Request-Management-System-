import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Document } from './documentsSlice';
import { User, UserState } from '../types/userTypes';
import { RootState } from './store';


interface PrintRequest {

    document: Document;
    user: Partial<User>,
    copies: number;
    color: boolean;
    instructions?: string;

    paperType: any

}


interface PrintRequestState {
    requests: Array<{
        id: string;
        copies: number;
        printMode: string;
        notes: string;
        document: Document;
    }>;
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
    async (requestData: { copies: number; color: boolean; notes: string;  paperType: any ; document: Document  }, { getState, rejectWithValue }) => {

        const state = getState() as RootState;
        const printRequestPayload: PrintRequest = {
            document: requestData.document,
            user: {
                user_id: state.user.user_id,
                email: state.user.email,
            },
            copies: requestData.copies,
            color: requestData.color,
            instructions: requestData.notes,
            paperType: requestData.paperType
        }

        console.log("P-request payload: ", printRequestPayload);
        try {
            const response = await axios.post(import.meta.env.VITE_SEND_PRINT_REQUEST_URL, printRequestPayload, {
                headers: {
                    'Content-Type': 'application/json',

                }

                
            });


            console.log("P-resuest response: ", response)
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const requestSlice = createSlice({
    name: 'printRequest',
    initialState,
    reducers: {
        addRequest: (state, action: PayloadAction<{ id: string; copies: number; printMode: string; notes: string; document: Document }>) => {
            state.requests.push(action.payload);
        },
        removeRequest: (state, action: PayloadAction<string>) => {
            state.requests = state.requests.filter(request => request.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
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
            });
    },
});

export const { addRequest, removeRequest, setLoading, setError } = requestSlice.actions;

export default requestSlice.reducer;