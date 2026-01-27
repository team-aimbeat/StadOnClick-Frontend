import { useEffect } from "react";
import { HiOutlineBell } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useListVendorNotificationsQuery,
  useMarkAllVendorNotificationsReadMutation,
  useMarkVendorNotificationReadMutation,
} from "@/features/vendorNotifications/api/vendorNotificationsApi";

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

const VendorNotifications = () => {
  const dispatch = useAppDispatch();
  const { data: notifications = [], isLoading } =
    useListVendorNotificationsQuery();
  const [markRead] = useMarkVendorNotificationReadMutation();
  const [markAllRead] = useMarkAllVendorNotificationsReadMutation();

  useEffect(() => {
    dispatch(setPageTitle("Notifications"));
  }, [dispatch]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <DashboardContainer className="space-y-4 lg:space-y-5">
      <TitleBreadCrumbs
        title="Notifications"
        breadCrumbTitle="Vendor / Notifications"
        className="w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            Lead updates
          </p>
          <p className="text-sm text-slate-500">
            {unreadCount ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <HiOutlineBell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {notification.title}
                </p>
                <p className="text-sm text-slate-600">
                  {notification.body ?? "New lead received."}
                </p>
                <p className="text-xs text-slate-400">
                  {formatTimestamp(notification.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              {notification.readAt ? "Read" : "Unread"}
              {!notification.readAt ? (
                <button
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-300"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {!isLoading && notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No notifications yet.
            </p>
            <p className="text-sm text-slate-500">
              New lead alerts will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </DashboardContainer>
  );
};

export default VendorNotifications;
