export type SupportTicketStatus = "OPEN" | "WAITING" | "RESOLVED" | "CLOSED";
export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SupportTicketCategory =
  | "BOOKING"
  | "PAYOUT"
  | "KYC"
  | "SERVICE"
  | "SUBSCRIPTION"
  | "OTHER";
export type SupportActorRole = "VENDOR" | "ADMIN" | "SUPPORT_ADMIN" | "MODERATOR";

export type TicketActor = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
};

export type TicketVendor = {
  id: string;
  businessName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  profileImageUrl?: string | null;
};

export type TicketEvent = {
  id: string;
  type: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
  performedBy: TicketActor | null;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  lastActivityAt: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastMessageByRole?: SupportActorRole | null;
  unread?: boolean;
  vendor: TicketVendor;
  createdBy: TicketActor;
  assignedTo?: TicketActor | null;
  events?: TicketEvent[];
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderUserId: string;
  senderRoleSnapshot: SupportActorRole | string;
  body: string;
  createdAt: string;
};

export type TicketParticipant = {
  id: string;
  ticketId: string;
  userId: string;
  roleSnapshot: SupportActorRole | string;
  joinedAt: string;
  leftAt: string | null;
};

export type PaginatedTickets<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};
