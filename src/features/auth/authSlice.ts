import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { AuthUser } from "./types/auth.types"

type AuthState = {
  user: AuthUser | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
    clearAuth(state) {
      state.user = null
    },
  },
})

export const { setUser, clearAuth } = authSlice.actions
export default authSlice.reducer
