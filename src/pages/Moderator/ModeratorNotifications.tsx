import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
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
        breadCrumbTitle="Moderator / Notifications"
      />

      <Card className="border border-slate-200/80 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Latest updates</p>
            <Button variant="ghost" size="sm" onClick={handleMarkAll}>
              Mark all as read
            </Button>
          </div>

          <div className="space-y-3">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                    notification.readAt
                      ? "border-slate-200/80 bg-white"
                      : "border-blue-200 bg-blue-50/70"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {notification.escalation
                        ? `${notification.escalation.ticketNumber} - ${notification.escalation.vendorName}`
                        : notification.body ?? "Escalation update"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      to={`/moderator/escalations/${notification.entityId}`}
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
              ))
            ) : (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
