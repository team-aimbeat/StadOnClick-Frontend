import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Search, Filter, Dot } from "lucide-react";
import { Contact } from "../types";

type ChatSidebarProps = {
  contacts: Contact[];
  selectedId: number | null;
  onSelect: (contact: Contact) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  filter: "all" | "active" | "unread";
  onFilterChange: (filter: "all" | "active" | "unread") => void;
  isShowChatMenu: boolean;
  toggleMenu: () => void;
};

export function ChatSidebar({
  contacts,
  selectedId,
  onSelect,
  searchTerm,
  onSearch,
  filter,
  onFilterChange,
  isShowChatMenu,
  toggleMenu,
}: ChatSidebarProps) {
  return (
    <div
      className={`panel p-4 flex-none w-full max-w-xs absolute xl:relative z-10 space-y-4 xl:h-full overflow-hidden ${
        isShowChatMenu ? "!block" : "hidden xl:block"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Inbox
          </p>
          <p className="text-sm text-slate-500">Conversations</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="xl:hidden"
          aria-label="Close menu"
          onClick={toggleMenu}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "unread"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => onFilterChange(f)}
            >
              {f === "all" && "All"}
              {f === "active" && "Active"}
              {f === "unread" && "Unread"}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <PerfectScrollbar className="chat-users relative h-full min-h-[200px] sm:h-[calc(100vh_-_320px)] space-y-1 ltr:pr-2 rtl:pl-2">
        {contacts.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-500">
            No conversations match your filters.
          </div>
        )}
        {contacts.map((person) => {
          const isSelected = selectedId === person.userId;
          const unread = person.unreadCount ?? 0;
          return (
            <button
              key={person.userId}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/60 ${
                isSelected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
              }`}
              onClick={() => onSelect(person)}
            >
              <div className="relative flex-none">
                <img
                  src={person.path}
                  className="h-11 w-11 rounded-full object-cover"
                  alt={person.name}
                />
                {person.status !== "offline" && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{person.name}</p>
                  {person.role && (
                    <Badge variant="outline" className="rounded-full border-slate-200 text-[11px]">
                      {person.role}
                    </Badge>
                  )}
                  {unread > 0 && (
                    <Badge className="rounded-full bg-blue-100 text-blue-700" variant="outline">
                      {unread}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">{person.preview}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Dot className="h-4 w-4" />
                  {person.time}
                </div>
              </div>
            </button>
          );
        })}
      </PerfectScrollbar>
    </div>
  );
}

export default ChatSidebar;
