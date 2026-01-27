import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SupportRealtimeState = {
  connected: boolean;
  unreadTotal: number;
};

const initialState: SupportRealtimeState = {
  connected: false,
  unreadTotal: 0,
};

const supportRealtimeSlice = createSlice({
  name: "supportRealtime",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setUnreadTotal(state, action: PayloadAction<number>) {
      state.unreadTotal = action.payload;
    },
  },
});

export const { setConnected, setUnreadTotal } = supportRealtimeSlice.actions;
export default supportRealtimeSlice.reducer;
