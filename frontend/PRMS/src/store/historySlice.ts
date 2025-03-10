import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ReactNode } from "react";
import { Key } from "readline";

export interface PrintRequest {
  copies: ReactNode;
  createdAt: string | number | Date;
  user: any;
  requestId: Key | null | undefined;
  document: any;
  someProperty: any;
  id?: number;
  documentName: string;
  pages: number;
  date: string;
  status: string;
  executedBy: string;
}

// Récupérer toutes les impressions
export const fetchPrintHistory = createAsyncThunk(
    "history/fetchPrintHistory",
    async () => {
      const response = await axios.get("http://localhost:8081/api/print-requests");
      console.log("API Response:", response.data); // Ajout pour debug
      return response.data;
    }
  );
  



const historySlice = createSlice({
  name: "history",
  initialState: { data: [] as PrintRequest[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrintHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrintHistory.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchPrintHistory.rejected, (state) => {
        state.loading = false;
      });
  },
  
});

export default historySlice.reducer;
