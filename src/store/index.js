import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import planningReducer from './slices/planningSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        planning: planningReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
