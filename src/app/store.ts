import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";
import themeConfigSlice from "@/features/Layout/themeConfigSlice";

import { authApi } from "@/features/auth/api/authApi";
import { preferencesApi } from "@/features/preferences/api/preferencesApi";
import { vendorOfferingsApi } from "@/services/vendorOfferingsApi";
import { serviceCategoriesApi } from "@/services/serviceCategoriesApi";
import { serviceMediaApi } from "@/services/serviceMediaApi";
import { vendorServicesApi } from "@/services/vendorServicesApi";
import { adminVendorApi } from "@/features/admin/vendors/api/vendorsApi";
import { bookingsApi } from "@/services/bookingsApi";
import { vendorcouponsApi } from "@/services/vendoiCouponsApi";
import { adminLeadPlansApi } from "@/features/adminLeads/api/adminLeadPlans.api";
import { vendorLeadSubscriptionsApi } from "@/features/vendorLeadSubscriptions/api/vendorLeadSubscriptions.api";
import { adminStaffApi } from "@/features/admin/staff/adminStaffApi";
import { supportApi } from "@/features/support/supportApi";
import supportRealtimeReducer from "@/features/support/supportRealtimeSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { escalationApi } from "@/features/escalations/escalationApi";
import { systemHealthApi } from "@/features/systemHealth/systemHealthApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    themeConfig: themeConfigSlice,
    supportRealtime: supportRealtimeReducer,
    notifications: notificationsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [preferencesApi.reducerPath]: preferencesApi.reducer,
    [vendorOfferingsApi.reducerPath]: vendorOfferingsApi.reducer,
    [serviceCategoriesApi.reducerPath]: serviceCategoriesApi.reducer,
    [serviceMediaApi.reducerPath]: serviceMediaApi.reducer,
    [vendorServicesApi.reducerPath]: vendorServicesApi.reducer,
    [adminVendorApi.reducerPath]: adminVendorApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [vendorcouponsApi.reducerPath]: vendorcouponsApi.reducer,
    [adminLeadPlansApi.reducerPath]: adminLeadPlansApi.reducer,
    [vendorLeadSubscriptionsApi.reducerPath]:
      vendorLeadSubscriptionsApi.reducer,
    [adminStaffApi.reducerPath]: adminStaffApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [escalationApi.reducerPath]: escalationApi.reducer,
    [systemHealthApi.reducerPath]: systemHealthApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(preferencesApi.middleware)
      .concat(vendorOfferingsApi.middleware)
      .concat(serviceCategoriesApi.middleware)
      .concat(serviceMediaApi.middleware)
      .concat(vendorServicesApi.middleware)
      .concat(adminVendorApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(vendorcouponsApi.middleware)
      .concat(adminLeadPlansApi.middleware)
      .concat(vendorLeadSubscriptionsApi.middleware)
      .concat(adminStaffApi.middleware)
      .concat(supportApi.middleware)
      .concat(escalationApi.middleware)
      .concat(systemHealthApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
