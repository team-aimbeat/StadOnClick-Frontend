import PerfectScrollbar from "react-perfect-scrollbar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Delete, MoreVertical, Search, ShieldCheck, ShieldX } from "lucide-react";
import type { AgentUser, Contact, Message } from "../types";

type ChatConversationProps = {
  contact: Contact | null;
  agent: AgentUser;
  isRtl: boolean;
  onToggleMenu: () => void;
};

const formatTime = (time?: string) => time || "just now";

export function ChatConversation({ contact, agent, isRtl, onToggleMenu }: ChatConversationProps) {
  if (!contact) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Select a conversation</p>
        <p className="mt-1 text-sm text-slate-500">Choose a user on the left to start replying.</p>
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Tips: Keep replies short, use quick actions to escalate, and mark resolved when done.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 xl:hidden"
          aria-label="Open inbox menu"
          onClick={onToggleMenu}
        >
          Open inbox
        </Button>
      </div>
    );
  }

  const dayGroups = contact.messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const key = msg.createdAt || "Today";
    acc[key] = acc[key] ? [...acc[key], msg] : [msg];
    return acc;
  }, {});

  const sortedGroups = Object.entries(dayGroups);

  return (
    <div className="panel flex-1 p-0">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative flex-none">
            <img src={contact.path} className="h-12 w-12 rounded-full object-cover" alt="" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                contact.status === "offline" ? "bg-slate-300" : "bg-emerald-400"
              }`}
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-slate-900">{contact.name}</p>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {contact.role ?? "User"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {contact.lastSeen ?? (contact.status === "active" ? "Active now" : "Offline")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Conversation actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Search className="mr-2 h-4 w-4" />
                Search
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy transcript
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600">
                <Delete className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label="Toggle sidebar"
            onClick={onToggleMenu}
          >
            <ShieldX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PerfectScrollbar className="chat-conversation-box relative flex-1 min-h-[160px] max-h-[calc(100vh_-_220px)] sm:max-h-[calc(100vh_-_240px)]">
        <div className="space-y-6 p-4 pb-24">
          {sortedGroups.map(([day, messages]) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center justify-center">
                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                  {day}
                </span>
              </div>
              {messages.map((message, index) => {
                const isOutgoing = message.fromUserId === agent.id;
                const key = message.id ?? `${message.fromUserId}-${message.toUserId}-${index}`;
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 ${
                      isOutgoing ? "justify-end" : ""
                    }`}
                  >
                    <div className={`flex-none ${isOutgoing ? "order-2" : ""}`}>
                      <img
                        src={isOutgoing ? agent.path : contact.path}
                        className="h-9 w-9 rounded-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="space-y-1 max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isOutgoing
                            ? "bg-[#0b59a2] text-white"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {message.text}
                      </div>
                      <div
                        className={`text-[11px] text-slate-400 ${
                          isOutgoing ? "text-right" : ""
                        }`}
                      >
                        {formatTime(message.time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </PerfectScrollbar>
    </div>
  );
}

export default ChatConversation;
