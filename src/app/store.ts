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
import { vendorOrdersApi } from "@/services/vendorOrdersApi";
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
import { vendorSponsorshipsApi } from "@/features/vendorSponsorships/api/vendorSponsorships.api";
import { adminSponsorshipsApi } from "@/features/adminSponsorships/api/adminSponsorships.api";
import { serviceReviewsApi } from "@/services/serviceReviewsApi";
import { vendorProfileApi } from "@/features/vendorProfile/api/vendorProfileApi";

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
    [vendorOrdersApi.reducerPath]: vendorOrdersApi.reducer,
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
    [vendorSponsorshipsApi.reducerPath]: vendorSponsorshipsApi.reducer,
    [adminSponsorshipsApi.reducerPath]: adminSponsorshipsApi.reducer,
    [serviceReviewsApi.reducerPath]: serviceReviewsApi.reducer,
    [vendorProfileApi.reducerPath]: vendorProfileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(preferencesApi.middleware)
      .concat(vendorOfferingsApi.middleware)
      .concat(serviceCategoriesApi.middleware)
      .concat(serviceMediaApi.middleware)
      .concat(vendorServicesApi.middleware)
      .concat(vendorOrdersApi.middleware)
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
      .concat(adminBookingsApi.middleware)
      .concat(vendorSponsorshipsApi.middleware)
      .concat(adminSponsorshipsApi.middleware)
      .concat(serviceReviewsApi.middleware)
      .concat(vendorProfileApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
