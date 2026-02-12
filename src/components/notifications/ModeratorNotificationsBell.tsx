import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
  useModeratorReadAllNotificationsMutation,
} from "@/features/escalations/escalationApi";
import { formatRelativeTime } from "@/components/notifications/notification.utils";

type Props = {
  className?: string;
};

export default function ModeratorNotificationsBell({ className }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useModeratorListNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markRead] = useModeratorMarkNotificationReadMutation();
  const [markAllRead] = useModeratorReadAllNotificationsMutation();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const handleSelect = async (notificationId: string, entityId: string) => {
    try {
      await markRead(notificationId).unwrap();
    } catch {
      // ignore
    }
    setOpen(false);
    navigate(`/admin/moderator/escalations/${entityId}`);
  };

  const handleMarkAll = async () => {
    await markAllRead().unwrap();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("relative", className)}>
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-90 max-h-120 max-w-[calc(100vw-24px)] p-0"
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600"
              >

                {unreadCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-90">
          {notifications.length ? (
            <div className="space-y-1 px-2 py-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    handleSelect(notification.id, notification.entityId);
                  }}
                  className="cursor-pointer p-0 focus:bg-transparent"
                >
                  <div
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-xl border px-3 py-2 text-left transition",
                      notification.readAt
                        ? "border-transparent hover:bg-slate-50"
                        : "border-blue-100 bg-blue-50/70"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {notification.escalation
                        ? `${notification.escalation.ticketNumber} - ${notification.escalation.vendorName}`
                        : notification.body ?? "Escalation update"}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Bell className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-slate-800">No notifications</p>
              <p className="text-xs text-slate-500">You're all caught up.</p>
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
            onClick={() => navigate("/admin/moderator/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
