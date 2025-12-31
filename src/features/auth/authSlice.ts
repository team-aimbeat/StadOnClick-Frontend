import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signupStart: (state) => {
      state.loading = true;
    },
    signupSuccess: (state, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
    },
    signupFailure: (state) => {
      state.loading = false;
    },
  },
});

export const { signupStart, signupSuccess, signupFailure } =
  authSlice.actions;

export default authSlice.reducer;
