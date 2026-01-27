import { io, type Socket } from "socket.io-client";

import { store } from "@/app/store";
import { supportApi } from "@/features/support/supportApi";
import { setConnected, setUnreadTotal } from "@/features/support/supportRealtimeSlice";
import type { TicketMessage } from "@/features/support/support.types";
import { addNotification } from "@/features/notifications/notificationsSlice";
import { buildNotification } from "@/components/notifications/notification.utils";

let socket: Socket | null = null;
const recentMessageByTicket = new Map<string, number>();
const recentNotificationKeys = new Map<string, number>();
const NOTIFICATION_DEDUP_MS = 4000;

function shouldDedupNotification(key: string) {
  const now = Date.now();
  const last = recentNotificationKeys.get(key);
  if (last && now - last < NOTIFICATION_DEDUP_MS) return true;
  recentNotificationKeys.set(key, now);
  return false;
}

function getSocketConfig() {
  const socketUrl = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "").trim();
  if (!socketUrl) throw new Error("Missing VITE_SOCKET_URL or VITE_API_URL");

  const url = new URL(socketUrl);
  const origin = `${url.protocol}//${url.host}`;

  const basePath = url.pathname.replace(/\/$/, "");
  const defaultPath = basePath && basePath !== "/" ? `${basePath}/socket.io` : "/socket.io";
  const rawPath = (import.meta.env.VITE_SOCKET_PATH || defaultPath).trim();
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  return { origin, path };
}

function setUnread(total: number) {
  store.dispatch(setUnreadTotal(total));
  try {
    store.dispatch(
      supportApi.util.updateQueryData("adminUnreadCount", undefined, (draft) => {
        if (draft) draft.total = total;
      })
    );
  } catch {
    /* ignore cache miss */
  }
}

function bumpUnread() {
  const current = store.getState().supportRealtime.unreadTotal ?? 0;
  setUnread(current + 1);
}

export function initSupportSocket() {
  if (socket) return socket;

  const { origin, path } = getSocketConfig();
  const rawNamespace = (import.meta.env.VITE_SOCKET_NAMESPACE || "/support").trim();
  const namespace = rawNamespace.startsWith("/") ? rawNamespace : `/${rawNamespace}`;

  console.info("Support socket init", { origin, path, namespace });

  socket = io(`${origin}${namespace}`, {
    path,
    transports: ["polling", "websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[support] socket connected", socket?.id);
    store.dispatch(setConnected(true));
  });

  socket.on("connect_error", (err: any) => {
    console.warn("[support] socket connect_error", err?.message || err, err?.data);
    store.dispatch(setConnected(false));
  });

  socket.on("disconnect", (reason) => {
    console.warn("[support] socket disconnected", reason);
    store.dispatch(setConnected(false));
  });

  socket.on(
    "support:message.created",
    (payload: { ticketId: string; message: TicketMessage; lastMessagePreview?: string }) => {
      const { ticketId, message } = payload;
      const currentUserId = store.getState().auth.user?.id;
      const isSelfMessage = Boolean(currentUserId && message?.senderUserId === currentUserId);
      const isVendorMessage = message?.senderRoleSnapshot === "VENDOR";

      if (ticketId) {
        recentMessageByTicket.set(ticketId, Date.now());
      }

      try {
        store.dispatch(
          supportApi.util.updateQueryData("adminGetTicketMessages", { id: ticketId }, (draft) => {
            if (!draft) return;
            draft.push(message);
          })
        );
      } catch {}

      store.dispatch(
        supportApi.util.invalidateTags([
          { type: "SupportTickets", id: "LIST" },
          { type: "SupportTicket", id: ticketId },
          { type: "SupportUnread", id: "COUNT" },
        ])
      );

      if (isVendorMessage) {
        bumpUnread();
      }

      if (!isSelfMessage) {
        const key = `MESSAGE_RECEIVED:${ticketId}:${message?.id ?? ""}`;
        if (!shouldDedupNotification(key)) {
          store.dispatch(addNotification(buildNotification("MESSAGE_RECEIVED", payload)));
        }
      }
    }
  );

  socket.on("support:ticket.created", (payload: { id?: string; ticketNumber?: string; subject?: string }) => {
    store.dispatch(
      supportApi.util.invalidateTags([
        { type: "SupportTickets", id: "LIST" },
        { type: "SupportUnread", id: "COUNT" },
      ])
    );

    bumpUnread();
    const key = `TICKET_CREATED:${payload?.id ?? ""}:${payload?.ticketNumber ?? ""}`;
    if (!shouldDedupNotification(key)) {
      store.dispatch(addNotification(buildNotification("TICKET_CREATED", payload)));
    }
  });

  socket.on("support:ticket.updated", (payload: { id: string; status?: string; assignedToUserId?: string | null }) => {
    store.dispatch(
      supportApi.util.invalidateTags([
        { type: "SupportTickets", id: "LIST" },
        { type: "SupportTicket", id: payload.id },
      ])
    );

    const lastMessageAt = recentMessageByTicket.get(payload.id);
    const suppressStatus =
      Boolean(payload.status) &&
      Boolean(lastMessageAt) &&
      Date.now() - (lastMessageAt ?? 0) < NOTIFICATION_DEDUP_MS;

    if (payload.assignedToUserId) {
      const key = `TICKET_ASSIGNED:${payload.id}:${payload.assignedToUserId ?? ""}`;
      if (!shouldDedupNotification(key)) {
        store.dispatch(addNotification(buildNotification("TICKET_ASSIGNED", payload)));
      }
    }

    if (payload.status && !suppressStatus) {
      const key = `STATUS_UPDATED:${payload.id}:${payload.status}`;
      if (!shouldDedupNotification(key)) {
        store.dispatch(addNotification(buildNotification("STATUS_UPDATED", payload)));
      }
    }
  });

  socket.on("support:ticket.unread", (payload: { total: number }) => {
    setUnread(payload.total ?? 0);
  });

  return socket;
}

export function getSupportSocket() {
  return socket;
}
