import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Bell, Check } from "lucide-react";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
  useModeratorReadAllNotificationsMutation,
} from "@/features/escalations/escalationApi";
import { formatRelativeTime } from "@/components/notifications/notification.utils";

export default function ModeratorNotifications() {
  const { data: notifications = [] } = useModeratorListNotificationsQuery();
  const [markRead] = useModeratorMarkNotificationReadMutation();
  const [markAll] = useModeratorReadAllNotificationsMutation();
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to mark notification");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAll().unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to mark all");
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs
        title="Notifications"
        breadCrumbTitle="Admin / Moderator / Notifications"
      />

      <Card className="border border-slate-200/80 bg-white/95 shadow-sm">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Latest updates</p>
              <p className="text-xs text-slate-500">
                Stay on top of escalation changes and assignments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
              >
                {unreadCount} unread
              </Badge>
              <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-2">
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length ? (
              notifications.map((notification) => {
                const isUnread = !notification.readAt;
                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      isUnread
                        ? "border-blue-200 bg-blue-50/60"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${
                          isUnread ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {notification.title}
                          </p>
                          {isUnread ? (
                            <Badge className="h-5 rounded-full bg-blue-600 px-2 text-[10px] uppercase">
                              New
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-600">
                          {notification.escalation
                            ? `${notification.escalation.ticketNumber} - ${notification.escalation.vendorName}`
                            : notification.body ?? "Escalation update"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {notification.type ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {formatNotificationType(notification.type)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <Link
                        to={`/admin/moderator/escalations/${notification.entityId}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View escalation
                      </Link>
                      {!notification.readAt ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-500">New escalation activity will show up here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatNotificationType(value: string) {
  if (!value) return value;
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : ""))
    .join(" ");
}

