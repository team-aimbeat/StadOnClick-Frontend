import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  completed: false,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreferencesCompleted: (state) => {
      state.completed = true;
    },
  },
});

export const { setPreferencesCompleted } = preferencesSlice.actions;
export default preferencesSlice.reducer;
