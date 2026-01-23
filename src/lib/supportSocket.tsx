import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import React from "react";

import { store } from "@/app/store";
import { supportApi } from "@/features/support/supportApi";
import { setConnected, setUnreadTotal } from "@/features/support/supportRealtimeSlice";
import type { TicketMessage } from "@/features/support/support.types";

let socket: Socket | null = null;

function bumpUnread() {
  const current = store.getState().supportRealtime.unreadTotal ?? 0;
  store.dispatch(setUnreadTotal(current + 1));
}

export function initSupportSocket() {
  if (socket) return socket;

  socket = io(`${import.meta.env.VITE_API_URL}/support`, {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    store.dispatch(setConnected(true));
  });

  socket.on("disconnect", () => {
    store.dispatch(setConnected(false));
  });

  socket.on(
    "support:message.created",
    (payload: { ticketId: string; message: TicketMessage; lastMessagePreview?: string }) => {
      const { ticketId, message } = payload;
      try {
        store.dispatch(
          supportApi.util.updateQueryData("adminGetTicketMessages", { id: ticketId }, (draft) => {
            if (!draft) return;
            draft.push(message);
          })
        );
      } catch {
        /* cache may not exist yet */
      }

      store.dispatch(
        supportApi.util.invalidateTags([
          { type: "SupportTickets", id: "LIST" },
          { type: "SupportTicket", id: ticketId },
          { type: "SupportUnread", id: "COUNT" },
        ])
      );
      bumpUnread();

      toast.custom(
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
          <p className="font-semibold text-slate-900">New message on ticket</p>
          <p className="text-xs text-slate-600">{payload.lastMessagePreview ?? message.body}</p>
        </div>,
        { duration: 3000, position: "top-right" }
      );
    }
  );

  socket.on("support:ticket.created", (payload: { ticketNumber?: string; subject?: string }) => {
    store.dispatch(
      supportApi.util.invalidateTags([{ type: "SupportTickets", id: "LIST" }])
    );
    bumpUnread();
    toast.custom(
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold text-slate-900">New ticket created</p>
        <p className="text-xs text-slate-600">
          {payload?.ticketNumber ? `${payload.ticketNumber} • ${payload.subject ?? "New request"}` : "New support ticket"}
        </p>
      </div>,
      { duration: 3000, position: "top-right" }
    );
  });

  socket.on("support:ticket.updated", (payload: { id: string }) => {
    store.dispatch(
      supportApi.util.invalidateTags([
        { type: "SupportTickets", id: "LIST" },
        { type: "SupportTicket", id: payload.id },
      ])
    );
  });

  socket.on("support:ticket.unread", (payload: { total: number }) => {
    store.dispatch(setUnreadTotal(payload.total ?? 0));
  });

  return socket;
}

export function getSupportSocket() {
  return socket;
}
