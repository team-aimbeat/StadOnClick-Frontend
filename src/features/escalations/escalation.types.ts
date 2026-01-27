export type EscalationCategory =
  | "REFUND"
  | "BOOKING"
  | "KYC"
  | "SUSPENSION"
  | "PAYMENT"
  | "PAYOUT"
  | "SECURITY"
  | "OTHER";

export type EscalationSeverity = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type EscalationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "RESOLVED"
  | "REJECTED";

export type EscalationActorRole = "ADMIN" | "SUPPORT_ADMIN" | "MODERATOR";

export type EscalationActor = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
};

export type EscalationComment = {
  id: string;
  escalationId: string;
  userId: string;
  roleSnapshot: EscalationActorRole;
  body: string;
  createdAt: string;
  author: EscalationActor | null;
};

export type EscalationTicketSnapshot = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  lastActivityAt: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  vendor: {
    id: string;
    businessName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
};

export type EscalationSummary = {
  id: string;
  ticketId: string;
  category: EscalationCategory;
  severity: EscalationSeverity;
  status: EscalationStatus;
  reason: string;
  description?: string;
  resolutionSummary?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: EscalationActor;
  assignedToModerator: EscalationActor | null;
  ticket?: EscalationTicketSnapshot | null;
  comments?: EscalationComment[];
};

export type EscalationInboxItem = {
  id: string;
  ticketId: string;
  category: EscalationCategory;
  severity: EscalationSeverity;
  status: EscalationStatus;
  reason: string;
  createdAt: string;
  updatedAt: string;
  assignedToModeratorId: string | null;
  ticket: {
    id: string;
    ticketNumber: string;
    subject: string;
    lastActivityAt: string;
    vendor: { id: string; businessName: string };
  };
};

export type EscalationDetail = EscalationSummary & {
  description: string;
  comments: EscalationComment[];
};

export type PaginatedEscalations<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ModeratorNotification = {
  id: string;
  type: "ESCALATION_CREATED" | "ESCALATION_ASSIGNED" | "ESCALATION_RESOLVED";
  title: string;
  body: string | null;
  entityType: "ESCALATION";
  entityId: string;
  readAt: string | null;
  createdAt: string;
  escalation?: {
    id: string;
    category: string;
    severity: string;
    status: string;
    ticketNumber: string;
    vendorName: string;
  } | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};
