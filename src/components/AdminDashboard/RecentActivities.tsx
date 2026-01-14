import React from "react";
import { cn } from "@/lib/utils";
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

const statusBadge = (status: string) => {
  const s = status.toLowerCase();

  if (s.includes("delivered"))
    return "bg-emerald-100 text-emerald-800";

  if (s.includes("pending"))
    return "bg-amber-100 text-amber-700";

  if (s.includes("cancel"))
    return "bg-rose-100 text-rose-700";

  if (s.includes("transit"))
    return "bg-sky-100 text-sky-700";

  return "bg-slate-100 text-slate-600";
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  title = "Recent Activity",
  activities = recentActivities,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded border border-slate-200 bg-white p-0",
        className
      )}
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          View All &rarr;
        </button>
      </div>
      <div className="mt-4 px-4 pb-4">
        <div className="overflow-hidden rounded-[26px] border border-slate-100 bg-white">
          <div className="grid grid-cols-[minmax(220px,1.6fr)_minmax(120px,0.9fr)_minmax(140px,0.9fr)_minmax(120px,0.8fr)_minmax(140px,1fr)] items-center gap-6 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400">
            <span>Customer</span>
            <span>ID</span>
            <span>Retained</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="grid grid-cols-[minmax(220px,1.6fr)_minmax(120px,0.9fr)_minmax(140px,0.9fr)_minmax(120px,0.8fr)_minmax(140px,1fr)] items-center gap-6 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={activity.avatar || profile7}
                    alt={activity.name}
                    className="h-10 w-10 rounded-full border border-slate-100 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{activity.name}</p>
                    <p className="text-xs text-slate-500">{activity.category}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-800">#{activity.id}</div>
                <div className="text-sm text-slate-500">{activity.retained}</div>
                <div className="text-sm font-semibold text-slate-900">{activity.price}</div>
                <div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusBadge(activity.status)
                    )}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;

