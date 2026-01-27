import { MessageCircle, RefreshCw, Ticket, UserCheck } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: "TICKET_CREATED" | "MESSAGE_RECEIVED" | "TICKET_ASSIGNED" | "STATUS_UPDATED";
  title: string;
  description?: string;
  ticketId?: string;
  ticketNumber?: string;
  createdAt: string;
  isRead: boolean;
};

const buildNotificationId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function buildNotification(
  type: NotificationItem["type"],
  payload: any
): NotificationItem {
  const ticketId = payload?.ticketId ?? payload?.id ?? undefined;
  const ticketNumber = payload?.ticketNumber ?? undefined;
  const subject = payload?.subject ?? undefined;
  const preview =
    payload?.lastMessagePreview ||
    payload?.message?.body ||
    payload?.description ||
    payload?.note ||
    "";

  const fallbackTitle =
    type === "TICKET_ASSIGNED"
      ? "Ticket assigned"
      : type === "STATUS_UPDATED"
        ? "Status updated"
        : "Support update";

  const title =
    ticketNumber
      ? `Ticket ${ticketNumber}`
      : subject || fallbackTitle;

  const description =
    typeof preview === "string" && preview.length
      ? preview.slice(0, 120)
      : subject;

  return {
    id: buildNotificationId(),
    type,
    title,
    description,
    ticketId,
    ticketNumber,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
}

export function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 45) return "Just now";
  if (diffSeconds < 3600) return `${Math.max(1, Math.floor(diffSeconds / 60))}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  if (diffSeconds < 172800) return "Yesterday";

  return date.toLocaleDateString();
}

export function getNotificationIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "TICKET_CREATED":
      return Ticket;
    case "MESSAGE_RECEIVED":
      return MessageCircle;
    case "TICKET_ASSIGNED":
      return UserCheck;
    case "STATUS_UPDATED":
    default:
      return RefreshCw;
  }
}

export function getNotificationRoute(notification: NotificationItem) {
  if (!notification.ticketId) return "/admin/notifications";

  if (
    notification.type === "TICKET_CREATED" ||
    notification.type === "MESSAGE_RECEIVED"
  ) {
    return `/admin/chat?ticketId=${notification.ticketId}`;
  }

  return `/admin/support?ticketId=${notification.ticketId}`;
}
