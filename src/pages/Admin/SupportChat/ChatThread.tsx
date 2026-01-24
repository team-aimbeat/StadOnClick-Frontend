import { useEffect, useMemo, useRef } from "react";
import { Inbox, MessageCircle } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupportTicket, TicketMessage } from "@/features/support/support.types";
import { cn } from "@/lib/utils";

type ChatRow = {
  id: string;
  showDay: boolean;
  dayLabel: string;
  message: TicketMessage;
};

type Props = {
  ticket?: SupportTicket;
  messages?: TicketMessage[];
  isLoading?: boolean;
  authUserId?: string;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDayLabel = (dateKey: string) => {
  const day = new Date(dateKey);
  if (Number.isNaN(day.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (day.toDateString() === today.toDateString()) return "Today";
  if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
  return day.toLocaleDateString();
};

export default function ChatThread({ ticket, messages, isLoading, authUserId }: Props) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo<ChatRow[]>(() => {
    if (!messages?.length) return [];
    const output: ChatRow[] = [];
    let lastDay = "";
    messages.forEach((message) => {
      const dayKey = new Date(message.createdAt).toDateString();
      const showDay = dayKey !== lastDay;
      if (showDay) {
        lastDay = dayKey;
      }
      output.push({
        id: message.id,
        showDay,
        dayLabel: formatDayLabel(dayKey),
        message,
      });
    });
    return output;
  }, [messages]);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;
    const viewport = root.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages?.length, ticket?.id]);

  return (
    <ScrollArea
      ref={scrollRootRef}
      className="flex-1 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_40%,_#f8fafc_100%)] px-4 py-6"
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      ) : !ticket ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <MessageCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Select a ticket to start</p>
          <p className="text-xs text-slate-500">Choose a conversation from the left.</p>
        </div>
      ) : rows.length ? (
        <div className="space-y-4">
          {rows.map(({ id, showDay, dayLabel, message }) => {
            const isVendor = message.senderRoleSnapshot === "VENDOR";
            const isOwn = authUserId ? message.senderUserId === authUserId : !isVendor;
            return (
              <div key={id} className="space-y-3">
                {showDay ? (
                  <div className="flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
                      {dayLabel}
                    </span>
                  </div>
                ) : null}
                <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                      isOwn
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.body}</p>
                    <div
                      className={cn(
                        "mt-2 text-[10px]",
                        isOwn ? "text-white/70" : "text-slate-400"
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No messages yet</p>
          <p className="text-xs text-slate-500">Start the conversation when you are ready.</p>
        </div>
      )}
    </ScrollArea>
  );
}
