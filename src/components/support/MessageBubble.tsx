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
      <div className={cn("max-w-[72%] space-y-1", isOwn ? "text-right" : "text-left")}>
        <p
          className={cn(
            "text-[11px] uppercase tracking-[0.12em]",
            isOwn ? "text-slate-400" : "text-slate-500"
          )}
        >
          {isOwn ? "You" : message.senderRoleSnapshot || "Vendor"}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isOwn
              ? "rounded-br-md bg-slate-900 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
          <p
            className={cn(
              "mt-2 text-[11px]",
              isOwn ? "text-slate-300" : "text-slate-400"
            )}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
