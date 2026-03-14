import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import planningReducer from './slices/planningSlice';
import vendorReducer from './slices/vendorSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        planning: planningReducer,
        vendor: vendorReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
