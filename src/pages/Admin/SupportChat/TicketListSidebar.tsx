import { Bell, RefreshCw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";

import TicketListItem from "./TicketListItem";

const statusOptions: { value: SupportTicketStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "WAITING", label: "Waiting" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const priorityOptions: { value: SupportTicketPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

type Props = {
  tickets: SupportTicket[];
  isLoading: boolean;
  selectedId: string | null;
  search: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  onSearch: (value: string) => void;
  onStatusChange: (value?: SupportTicketStatus) => void;
  onPriorityChange: (value?: SupportTicketPriority) => void;
  onSelectTicket: (id: string) => void;
  onRefresh: () => void;
};

export default function TicketListSidebar({
  tickets,
  isLoading,
  selectedId,
  search,
  status,
  priority,
  onSearch,
  onStatusChange,
  onPriorityChange,
  onSelectTicket,
  onRefresh,
}: Props) {
  return (
    <aside className="flex w-full flex-col border-b border-slate-200/80 bg-slate-50/60 lg:w-[380px] lg:border-b-0">
      <div className="sticky top-0 z-10 space-y-3 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Support</p>
            <p className="text-base font-semibold text-slate-900">Support Chat</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={status ?? "ALL"}
                  onValueChange={(value) =>
                    onStatusChange(value === "ALL" ? undefined : (value as SupportTicketStatus))
                  }
                >
                  {statusOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={priority ?? "ALL"}
                  onValueChange={(value) =>
                    onPriorityChange(value === "ALL" ? undefined : (value as SupportTicketPriority))
                  }
                >
                  {priorityOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Input
          placeholder="Search tickets"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-10 rounded-xl border-slate-200 bg-white"
        />
      </div>

      <ScrollArea className="flex-1">
        {isLoading && tickets.length === 0 ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-16 w-full" />
            ))}
          </div>
        ) : tickets.length ? (
          <div className="space-y-1 p-2">
            {tickets.map((ticket) => (
              <TicketListItem
                key={ticket.id}
                ticket={ticket}
                active={selectedId === ticket.id}
                onSelect={() => onSelectTicket(ticket.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No tickets yet</p>
            <p className="text-xs text-slate-500">You're all caught up.</p>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
