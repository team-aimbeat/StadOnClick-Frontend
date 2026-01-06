import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import themeConfigSlice from "@/features/Layout/themeConfigSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    themeConfig: themeConfigSlice,

  },
});

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
