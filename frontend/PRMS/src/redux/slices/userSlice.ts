import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  educationLevel: string;
}

const initialState: UserState = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah@eduplatform.com',
  phone: '+1 234 567 890',
  educationLevel: 'Level 3',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProfile } = userSlice.actions;
export default userSlice.reducer;