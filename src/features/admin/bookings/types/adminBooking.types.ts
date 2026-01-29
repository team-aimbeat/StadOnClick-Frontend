export type AdminBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED";

export type AdminBookingUser = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  profileImageKey?: string | null;
};

export type AdminBookingVendorProfile = {
  id: string;
  businessName: string;
  slug: string;
  status: string;
  country: string;
};

export type AdminBookingCategory = {
  id: string;
  name: string;
};

export type AdminBookingService = {
  id: string;
  title: string;
  status: string;
  category?: AdminBookingCategory | null;
};

export type AdminBookingSlot = {
  id: string;
  startTime: string;
  endTime?: string | null;
};

export type AdminBookingOrderItem = {
  id: string;
  orderNumber: string;
  quantity: number;
  priceOriginal: string;
  priceFinal: string;
  discountAmount: string;
};

export interface AdminBookingItem {
  id: string;
  status: AdminBookingStatus;
  createdAt: string;
  cancelledAt?: string | null;
  updatedAt: string;
  user: AdminBookingUser;
  vendorProfile: AdminBookingVendorProfile;
  vendorService: AdminBookingService;
  slot: AdminBookingSlot;
  orderItem: AdminBookingOrderItem;
}

export interface AdminBookingListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminBookingListResult {
  data: AdminBookingItem[];
  meta: AdminBookingListMeta;
}

export interface AdminBookingListResponse {
  success: boolean;
  data: AdminBookingListResult;
}

export interface AdminBookingListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  search?: string;
  status?: string;
  statuses?: string;
  vendorProfileId?: string;
  vendorServiceId?: string;
  userId?: string;
  slotId?: string;
  orderNumber?: string;
  minPrice?: string;
  maxPrice?: string;
  priceFrom?: string;
  priceTo?: string;
}
