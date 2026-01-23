import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";
import themeConfigSlice from "@/features/Layout/themeConfigSlice";

import { authApi } from "@/features/auth/api/authApi";
import { preferencesApi } from "@/features/preferences/api/preferencesApi";
import { adminVendorApi } from "@/features/admin/vendors/api/vendorsApi";
import { adminLeadPlansApi } from "@/features/adminLeads/api/adminLeadPlans.api";
import { vendorLeadSubscriptionsApi } from "@/features/vendorLeadSubscriptions/api/vendorLeadSubscriptions.api";
import { adminStaffApi } from "@/features/admin/staff/adminStaffApi";
import { supportApi } from "@/features/support/supportApi";
import supportRealtimeReducer from "@/features/support/supportRealtimeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    themeConfig: themeConfigSlice,
    supportRealtime: supportRealtimeReducer,
    [authApi.reducerPath]: authApi.reducer,
    [preferencesApi.reducerPath]: preferencesApi.reducer,
    [adminVendorApi.reducerPath]: adminVendorApi.reducer,
    [adminLeadPlansApi.reducerPath]: adminLeadPlansApi.reducer,
    [vendorLeadSubscriptionsApi.reducerPath]:
      vendorLeadSubscriptionsApi.reducer,
    [adminStaffApi.reducerPath]: adminStaffApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(preferencesApi.middleware)
      .concat(adminVendorApi.middleware)
      .concat(adminLeadPlansApi.middleware)
      .concat(vendorLeadSubscriptionsApi.middleware)
      .concat(adminStaffApi.middleware)
      .concat(supportApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
