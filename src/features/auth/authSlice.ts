import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  nickName: string | null;
  displayName: string;
  roles: string[];
  profileImageUrl: string | null;
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
