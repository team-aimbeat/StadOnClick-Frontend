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
import { vendorKycApi } from "@/services/vendorKycApi";
import { leadsApi } from "@/features/leads/api/leadsApi";
import { vendorNotificationsApi } from "@/features/vendorNotifications/api/vendorNotificationsApi";
import { adminKycApi } from "@/services/adminKycApi";
import { vendorWalletApi } from "@/features/vendorWallet/api/walletApi";
import { vendorStripeApi } from "@/features/vendorStripe/api/vendorStripeApi";
import { adminFinanceApi } from "@/features/admin/finance/api/adminFinanceApi";
import { adminBookingsApi } from "@/features/admin/bookings/api/adminBookingsApi";

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
    [vendorKycApi.reducerPath]: vendorKycApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [vendorNotificationsApi.reducerPath]: vendorNotificationsApi.reducer,
       [adminKycApi.reducerPath]: adminKycApi .reducer,
    [vendorWalletApi.reducerPath]: vendorWalletApi.reducer,
    [vendorStripeApi.reducerPath]: vendorStripeApi.reducer,
    [adminFinanceApi.reducerPath]: adminFinanceApi.reducer,
    [adminBookingsApi.reducerPath]: adminBookingsApi.reducer,
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
      .concat(vendorKycApi.middleware)
      .concat(adminLeadPlansApi.middleware)
      .concat(vendorLeadSubscriptionsApi.middleware)
      .concat(adminStaffApi.middleware)
      .concat(supportApi.middleware)
      .concat(escalationApi.middleware)
      .concat(systemHealthApi.middleware)
      .concat(leadsApi.middleware)
      .concat(vendorNotificationsApi.middleware)
      .concat(adminKycApi.middleware)
      .concat(vendorWalletApi.middleware)
      .concat(vendorStripeApi.middleware)
      .concat(adminFinanceApi.middleware)
      .concat(adminBookingsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
