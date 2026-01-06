import { configureStore } from "@reduxjs/toolkit";
import themeConfigSlice from "@/features/Layout/themeConfigSlice";

export const store = configureStore({
  reducer: {
    themeConfig: themeConfigSlice,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
