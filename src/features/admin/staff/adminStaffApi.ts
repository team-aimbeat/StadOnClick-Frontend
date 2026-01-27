import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  CreateStaffRequest,
  GetStaffRequest,
  StaffListResponse,
  StaffRole,
  StaffUser,
  UpdateStaffRolesRequest,
  UpdateStaffStatusRequest,
} from "./adminStaff.types";

const ROLE_MAP: Record<string, StaffRole> = {
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
  "SUPPORT ADMIN": "SUPPORT_ADMIN",
  SUPPORT: "SUPPORT_ADMIN",
  ADMIN_SUPPORT: "SUPPORT_ADMIN",
  MODERATOR: "MODERATOR",
  MOD: "MODERATOR",
};

function normalizeRoleForApi(role: StaffRole) {
  if (!role) return role;
  const normalized = String(role).trim().replace(/[\s-]+/g, "_").toUpperCase();
  return ROLE_MAP[normalized] ?? (normalized as StaffRole);
}

function normalizeRolesForApi(roles: StaffRole[]) {
  return roles.map((r) => normalizeRoleForApi(r));
}

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
        body: {
          ...body,
          role: normalizeRoleForApi(body.role),
        },
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
        body: {
          roles: normalizeRolesForApi(body.roles),
        },
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
