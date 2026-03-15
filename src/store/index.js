import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import planningReducer from './slices/planningSlice';
import vendorReducer from './slices/vendorSlice';
import promoteReducer from './slices/promoteSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        planning: planningReducer,
        vendor: vendorReducer,
        promote: promoteReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
