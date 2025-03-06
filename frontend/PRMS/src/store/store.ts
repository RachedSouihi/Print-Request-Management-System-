import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import documentsReducer from './documentsSlice';
import historyReducer from "./historySlice";
import profReducer from "./profSlice";
//import profSlicereducer from "./profSlice" ;
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    documents: documentsReducer,
    history: historyReducer,
    prof: profReducer,
    reducer: profReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;