import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import documentsReducer from './documentsSlice';

import requestSlice from './requestSlice'

import historyReducer from "./historySlice";
import profReducer from "./profSlice";
import profSlicereducer from "./profSlice" ;
import adminDocSlice from "./adminDocApi";
//import profSlicereducer from "./profSlice" ;


const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    documents: documentsReducer,
    printRequest: requestSlice,
   
    history: historyReducer,
    prof: profReducer,
    reducer: profReducer,
    admindoc: adminDocSlice,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;