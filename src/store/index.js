import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import planningReducer from './slices/planningSlice';
import vendorReducer from './slices/vendorSlice';
import vendorEventsReducer from './slices/vendorEventsSlice';
import promoteReducer from './slices/promoteSlice';
import feesReducer from './slices/feesSlice';
import managerEventsReducer from './slices/managerEventsSlice';
import promotionsConfigReducer from './slices/promotionsConfigSlice';
import dashboardReducer from './slices/dashboardSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        planning: planningReducer,
        vendor: vendorReducer,
        vendorEvents: vendorEventsReducer,
        promote: promoteReducer,
        fees: feesReducer,
        promotionsConfig: promotionsConfigReducer,
        managerEvents: managerEventsReducer,
        dashboard: dashboardReducer,
        notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
