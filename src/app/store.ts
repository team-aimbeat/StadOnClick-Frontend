import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";
import themeConfigSlice from "@/features/Layout/themeConfigSlice";

import { authApi } from "@/features/auth/api/authApi";
import { preferencesApi } from "@/features/preferences/api/preferencesApi";
import { serviceMediaApi } from "@/services/serviceMediaApi";
import { adminVendorApi } from "@/features/admin/vendors/api/vendorsApi";
import { bookingsApi } from "@/services/bookingsApi";
import { vendorcouponsApi } from "@/services/vendoiCouponsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    themeConfig: themeConfigSlice,
    [authApi.reducerPath]: authApi.reducer,
    [preferencesApi.reducerPath]: preferencesApi.reducer,
    [serviceMediaApi.reducerPath]: serviceMediaApi.reducer,
    [adminVendorApi.reducerPath]: adminVendorApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [vendorcouponsApi.reducerPath]: vendorcouponsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(preferencesApi.middleware)
      .concat(serviceMediaApi.middleware)
      .concat(adminVendorApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(vendorcouponsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
