import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatRelativeTime,
  getNotificationIcon,
  type NotificationItem,
} from "./notification.utils";

const typeTone: Record<NotificationItem["type"], string> = {
  TICKET_CREATED: "bg-blue-100 text-blue-700",
  MESSAGE_RECEIVED: "bg-emerald-100 text-emerald-700",
  TICKET_ASSIGNED: "bg-amber-100 text-amber-700",
  STATUS_UPDATED: "bg-slate-100 text-slate-700",
};

type NotificationRowProps = {
  notification: NotificationItem;
};

export default function NotificationRow({ notification }: NotificationRowProps) {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;
  const timeLabel = formatRelativeTime(notification.createdAt);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2 transition",
        isUnread ? "bg-blue-50/50" : "bg-transparent",
        "hover:bg-slate-50 dark:hover:bg-slate-800/70"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          typeTone[notification.type]
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {notification.title}
          </p>
          {notification.ticketNumber ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {notification.ticketNumber}
            </Badge>
          ) : null}
        </div>
        {notification.description ? (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {notification.description}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {timeLabel}
        </span>
        {isUnread ? (
          <span className="h-2 w-2 rounded-full bg-blue-600" />
        ) : null}
      </div>
    </div>
  );
}
