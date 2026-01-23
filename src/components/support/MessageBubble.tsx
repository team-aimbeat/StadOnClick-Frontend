import React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "./chatUtils";
import type { TicketMessage } from "@/features/support/support.types";

type Props = {
  message: TicketMessage;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isOwn ? "bg-[#d9fdd3]" : "bg-white"
        )}
      >
        <p className="text-base text-slate-900 whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p className="mt-1 text-[11px] text-slate-500 text-right">{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}
