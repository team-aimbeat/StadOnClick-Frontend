export type AdminOrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

export type AdminOrderUser = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  profileImageKey?: string | null;
  profileImageUrl?: string | null;
};

export type AdminOrderVendor = {
  id: string;
  businessName: string;
  slug: string;
  status: string;
  country: string;
  city?: {
    id: string;
    name: string;
  } | null;
};

export type AdminOrderCategory = {
  id: string;
  name: string;
};

export type AdminOrderService = {
  id: string;
  title: string;
  status: string;
  category?: AdminOrderCategory | null;
};

export type AdminOrderOffering = {
  id: string;
  name: string;
  service?: AdminOrderService | null;
};

export type AdminOrderSlot = {
  id: string;
  startTime: string;
  endTime?: string | null;
};

export type AdminOrderBooking = {
  id: string;
  status: string;
  createdAt: string;
  cancelledAt?: string | null;
  slot?: AdminOrderSlot | null;
};

export type AdminOrderLineItem = {
  id: string;
  orderNumber: string;
  quantity: number;
  priceOriginal: string;
  discountAmount: string;
  priceFinal: string;
  offering: AdminOrderOffering;
  bookings: AdminOrderBooking[];
};

export type AdminOrderCoupon = {
  id: string;
  redeemedAt: string;
  coupon: {
    id: string;
    code: string;
    title: string;
  };
};

export interface AdminOrderItem {
  id: string;
  status: AdminOrderStatus;
  currency: string;
  totalOriginal: string;
  totalDiscount: string;
  totalFinal: string;
  commissionRate: number;
  commissionAmount: string;
  vendorPayoutAmount: string;
  refundReason?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminOrderUser;
  vendor: AdminOrderVendor;
  items: AdminOrderLineItem[];
  coupons: AdminOrderCoupon[];
}

export interface AdminOrderListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOrderListResult {
  data: AdminOrderItem[];
  meta: AdminOrderListMeta;
}

export interface AdminOrderListResponse {
  success: boolean;
  data: AdminOrderListResult;
}

export interface AdminOrderListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  search?: string;
  status?: string;
  statuses?: string;
  vendorId?: string;
  userId?: string;
  orderId?: string;
  orderNumber?: string;
  offeringId?: string;
  serviceId?: string;
  year?: string;
  minTotal?: string;
  maxTotal?: string;
}
