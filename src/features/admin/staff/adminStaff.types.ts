export type StaffRole = "SUPPORT_ADMIN" | "MODERATOR";
export type StaffUserRole = StaffRole | "ADMIN";

export type StaffStatus = "ACTIVE" | "DISABLED";

export type StaffUser = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  status: StaffStatus;
  roles: StaffUserRole[];
  createdAt: string;
  lastLoginAt?: string | null;
};

export type StaffListResponse = {
  success: boolean;
  data: {
    items: StaffUser[];
    page: number;
    limit: number;
    total: number;
  };
};

export type GetStaffRequest = {
  q?: string;
  page?: number;
  limit?: number;
};

export type CreateStaffRequest = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  role: StaffRole;
};

export type UpdateStaffStatusRequest = {
  id: string;
  body: { status: StaffStatus };
};

export type UpdateStaffRolesRequest = {
  id: string;
  body: { roles: StaffRole[] };
};
