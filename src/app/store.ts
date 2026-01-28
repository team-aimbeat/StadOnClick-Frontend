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
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { escalationApi } from "@/features/escalations/escalationApi";
import { systemHealthApi } from "@/features/systemHealth/systemHealthApi";
import { leadsApi } from "@/features/leads/api/leadsApi";
import { serviceCategoriesApi } from "@/features/serviceCategories/api/serviceCategoriesApi";
import { vendorNotificationsApi } from "@/features/vendorNotifications/api/vendorNotificationsApi";
import { vendorWalletApi } from "@/features/vendorWallet/api/walletApi";
import { vendorStripeApi } from "@/features/vendorStripe/api/vendorStripeApi";
import { adminFinanceApi } from "@/features/admin/finance/api/adminFinanceApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    themeConfig: themeConfigSlice,
    supportRealtime: supportRealtimeReducer,
    notifications: notificationsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [preferencesApi.reducerPath]: preferencesApi.reducer,
    [adminVendorApi.reducerPath]: adminVendorApi.reducer,
    [adminLeadPlansApi.reducerPath]: adminLeadPlansApi.reducer,
    [vendorLeadSubscriptionsApi.reducerPath]:
      vendorLeadSubscriptionsApi.reducer,
    [adminStaffApi.reducerPath]: adminStaffApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [escalationApi.reducerPath]: escalationApi.reducer,
    [systemHealthApi.reducerPath]: systemHealthApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [serviceCategoriesApi.reducerPath]: serviceCategoriesApi.reducer,
    [vendorNotificationsApi.reducerPath]: vendorNotificationsApi.reducer,
    [vendorWalletApi.reducerPath]: vendorWalletApi.reducer,
    [vendorStripeApi.reducerPath]: vendorStripeApi.reducer,
    [adminFinanceApi.reducerPath]: adminFinanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(preferencesApi.middleware)
      .concat(adminVendorApi.middleware)
      .concat(adminLeadPlansApi.middleware)
      .concat(vendorLeadSubscriptionsApi.middleware)
      .concat(adminStaffApi.middleware)
      .concat(supportApi.middleware)
      .concat(escalationApi.middleware)
      .concat(systemHealthApi.middleware)
      .concat(leadsApi.middleware)
      .concat(serviceCategoriesApi.middleware)
      .concat(vendorNotificationsApi.middleware)
      .concat(vendorWalletApi.middleware)
      .concat(vendorStripeApi.middleware)
      .concat(adminFinanceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
