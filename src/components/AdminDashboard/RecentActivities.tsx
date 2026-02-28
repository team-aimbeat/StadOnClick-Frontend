import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill, {
  AdminPillTone,
} from "@/components/AdminDashboard/table/AdminPill";
import profile7 from "@/assets/images/profile-7.jpeg";
import profile8 from "@/assets/images/profile-8.jpeg";
import profile9 from "@/assets/images/profile-9.jpeg";
import profile10 from "@/assets/images/profile-10.jpeg";

interface Activity {
  id: string | number;
  name: string;
  category: string;
  status: string;
  price: string | number;
  retained: string;
  avatar?: string;
}

interface RecentActivitiesProps {
  title?: string;
  activities?: Activity[];
  className?: string;
  maxRows?: number;
}

export const recentActivities: Activity[] = [
  {
    id: 3445,
    name: "Paaji",
    category: "Yoga Classes",
    status: "Delivered",
    price: "$23",
    retained: "5 min ago",
    avatar: profile7,
  },
  {
    id: 3446,
    name: "Sultan",
    category: "Wedding Event",
    status: "Pending",
    price: "$23",
    retained: "12 min ago",
    avatar: profile8,
  },
  {
    id: 3447,
    name: "Tommy",
    category: "Finance",
    status: "Canceled",
    price: "$23",
    retained: "15 min ago",
    avatar: profile9,
  },
  {
    id: 3448,
    name: "Vikas",
    category: "Finance",
    status: "In Transit",
    price: "$23",
    retained: "17 min ago",
    avatar: profile10,
  },
];

const statusTone = (status: string): AdminPillTone => {
  const s = status.toLowerCase();

  if (s.includes("delivered")) return "success";
  if (s.includes("pending")) return "warning";
  if (s.includes("cancel")) return "danger";
  if (s.includes("transit")) return "info";

  return "neutral";
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  title = "Recent Activity",
  activities = recentActivities,
  className,
  maxRows = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(activities.length / maxRows));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const visibleActivities = useMemo(() => {
    const start = (currentPage - 1) * maxRows;
    return activities.slice(start, start + maxRows);
  }, [activities, currentPage, maxRows]);

  const hasActivities = visibleActivities.length > 0;
  const hasMore = totalPages > 1;
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>
        {hasMore && (
          <button className="text-xs font-semibold text-slate-500 transition hover:text-slate-700">
            View All &rarr;
          </button>
        )}
      </div>
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "customer", label: "Customer", width: "minmax(220px,1.6fr)" },
          { key: "id", label: "ID", width: "minmax(120px,0.9fr)" },
          { key: "retained", label: "Retained", width: "minmax(140px,0.9fr)" },
          { key: "amount", label: "Amount", width: "minmax(120px,0.8fr)", align: "right" },
          { key: "status", label: "Status", width: "minmax(140px,1fr)" },
        ]}
      >
        {hasActivities ? (
          visibleActivities.map((activity) => (
            <AdminTableRow key={activity.id}>
              <AdminTableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={activity.avatar || profile7}
                    alt={activity.name}
                    className="h-10 w-10 rounded-full border border-slate-100 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.category}
                    </p>
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell className="text-sm font-semibold text-slate-900">
                #{activity.id}
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-500">
                {activity.retained}
              </AdminTableCell>
              <AdminTableCell
                align="right"
                className="text-sm font-semibold text-slate-900"
              >
                {activity.price}
              </AdminTableCell>
              <AdminTableCell>
                <AdminPill tone={statusTone(activity.status)}>
                  {activity.status}
                </AdminPill>
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No records found
          </div>
        )}
      </AdminTable>
      {hasMore && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setCurrentPage(pageNumber)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors",
                currentPage === pageNumber
                  ? "bg-[#4F7DFF] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;

