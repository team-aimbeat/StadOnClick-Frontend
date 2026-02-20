import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  nickName: string | null;
  displayName: string;
  referralCode?: string | null;
  roles: string[];
  profileImageUrl: string | null;
  status: string;
  hasPassword: boolean;
  vendorAccess?: {
    hasVendorProfile: boolean;
    vendorId: string | null;
    isBusinessProfileComplete: boolean;
    lifecycleStatus: "DRAFT" | "ACTIVE" | "SUSPENDED";
    setupRequired: boolean;
  };
  nextAction?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  isBootstrapping: boolean;
};

const initialState: AuthState = {
  user: null,
  isBootstrapping: true, // 👈 important
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setBootstrapping(state, action: PayloadAction<boolean>) {
      state.isBootstrapping = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isBootstrapping = false;
    },
    clearAuth(state) {
      state.user = null
    },
  },
});

export const { setUser, setBootstrapping, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
