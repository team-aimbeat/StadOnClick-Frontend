// components/ui/cards/RecentActivities.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

interface Activity {
  id: string | number;
  name: string;
  category: string;
  status: string;
  price: string | number;
  avatar?: string;
}

interface RecentActivitiesProps {
  title?: string;
  activities?: Activity[];
  className?: string;
}

// Mock data
export const recentActivities: Activity[] = [
  {
    id: 3445,
    name: "Paaji",
    category: "Yoga Classes",
    status: "Delivered",
    price: "$23",
    avatar: "src/assets/images/profile-7.jpeg",
  },
  {
    id: 3446,
    name: "Sultan",
    category: "Wedding Event",
    status: "Pending",
    price: "$23",
    avatar: "src/assets/images/profile-8.jpeg",
  },
  {
    id: 3447,
    name: "Tommy",
    category: "Finance",
    status: "Canceled",
    price: "$23",
    avatar: "src/assets/images/profile-9.jpeg",
  },
  {
    id: 3448,
    name: "Vikas",
    category: "Finance",
    status: "In Transit",
    price: "$23",
    avatar: "src/assets/images/profile-10.jpeg",
  },
];

const statusBadge = (status: string) => {
  const s = status.toLowerCase();

  if (s.includes("delivered"))
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

  if (s.includes("pending"))
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

  if (s.includes("cancel"))
    return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";

  if (s.includes("transit"))
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  title = "Recent activities",
  activities = recentActivities,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3
          className="text-sm font-semibold text-gray-900 dark:text-gray-100"

        >
        {title}
        </h3>

        <button className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Table Wrapper (FULL BORDER) */}
      <div className="px-5 py-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div
            className="grid grid-cols-5 bg-gray-50 dark:bg-gray-800/40
                          text-xs font-medium text-gray-400 uppercase px-4 py-3"
          >
            <div>ID</div>
            <div>Name</div>

            <div>Category</div>
            <div>Status</div>
            <div>Price</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {activities.map((activity, index) => (
              <div
                key={`${activity.id}-${index}`}
                className="grid grid-cols-5 items-center text-sm px-4 py-3
                           hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
              >
                {/* ID */}
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {activity.id}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <img
                    src={activity.avatar || "/assets/images/user-profile.jpeg"}
                    alt={activity.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {activity.name}
                  </span>
                </div>

                {/* Category */}
                <div className="text-gray-600 dark:text-gray-400">
                  {activity.category}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      statusBadge(activity.status)
                    )}
                  >
                    {activity.status}
                  </span>
                </div>

                {/* Price */}
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {typeof activity.price === "number"
                    ? `$${activity.price}`
                    : activity.price}
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
