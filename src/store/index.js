import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import planningReducer from './slices/planningSlice';
import vendorReducer from './slices/vendorSlice';
import promoteReducer from './slices/promoteSlice';
import feesReducer from './slices/feesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        planning: planningReducer,
        vendor: vendorReducer,
        promote: promoteReducer,
        fees: feesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
