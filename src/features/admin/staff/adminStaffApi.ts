import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  CreateStaffRequest,
  GetStaffRequest,
  StaffListResponse,
  StaffUser,
  UpdateStaffRolesRequest,
  UpdateStaffStatusRequest,
} from "./adminStaff.types";

export const adminStaffApi = createApi({
  reducerPath: "adminStaffApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminStaff"],
  endpoints: (builder) => ({
    getStaff: builder.query<StaffListResponse["data"], GetStaffRequest | undefined>({
      query: (params) => ({
        url: "/admin/staff",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: StaffListResponse) => response.data,
      providesTags: ["AdminStaff"],
    }),

    createStaff: builder.mutation<StaffUser, CreateStaffRequest>({
      query: (body) => ({
        url: "/admin/staff",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminStaff"],
    }),

    updateStaffStatus: builder.mutation<StaffUser, UpdateStaffStatusRequest>({
      query: ({ id, body }) => ({
        url: `/admin/staff/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminStaff"],
    }),

    updateStaffRoles: builder.mutation<StaffUser, UpdateStaffRolesRequest>({
      query: ({ id, body }) => ({
        url: `/admin/staff/${id}/roles`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminStaff"],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffRolesMutation,
} = adminStaffApi;

export const useGetAdminStaffQuery = useGetStaffQuery;
export const useCreateAdminStaffMutation = useCreateStaffMutation;
export const useUpdateAdminStaffStatusMutation = useUpdateStaffStatusMutation;
export const useUpdateAdminStaffRolesMutation = useUpdateStaffRolesMutation;
