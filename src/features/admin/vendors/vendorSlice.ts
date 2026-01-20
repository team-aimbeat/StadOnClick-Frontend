import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vendor, VendorApplication } from "./types/vendor.types";

type AdminVendorsState = {
  applications: VendorApplication[];
  vendors: Vendor[];
};

const initialState: AdminVendorsState = {
  applications: [],
  vendors: [],
};

const adminVendorsSlice = createSlice({
  name: "adminVendors",
  initialState,
  reducers: {
    setVendorApplications(state, action: PayloadAction<VendorApplication[]>) {
      state.applications = action.payload;
    },

    setVendors(state, action: PayloadAction<Vendor[]>) {
      state.vendors = action.payload;
    },

    clearAdminVendors(state) {
      state.applications = [];
      state.vendors = [];
    },

    // Optional helpers (useful for instant UI updates)
    removeApplication(state, action: PayloadAction<string>) {
      state.applications = state.applications.filter(
        (app) => app.id !== action.payload
      );
    },

    updateApplicationStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: "APPROVED" | "REJECTED" | "PENDING";
      }>
    ) {
      const app = state.applications.find((a) => a.id === action.payload.id);
      if (app) {
        app.status = action.payload.status;
      }
    },
  },
});

export const {
  setVendorApplications,
  setVendors,
  clearAdminVendors,
  removeApplication,
  updateApplicationStatus,
} = adminVendorsSlice.actions;

export default adminVendorsSlice.reducer;
