import { NavLink } from "react-router-dom";
import {
  HiChartBar,
  HiInboxStack,
  HiBell,
} from "react-icons/hi2";

import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", to: "/admin/moderator/dashboard", icon: HiChartBar },
  { id: "escalations", label: "Escalations", to: "/admin/moderator/escalations", icon: HiInboxStack },
  { id: "notifications", label: "Notifications", to: "/admin/moderator/notifications", icon: HiBell },
];

export default function ModeratorSidebar() {
  return (
    <aside className="hidden w-60 flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="flex h-16 items-center justify-center border-b border-slate-200/80">
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          StadonClick Ops
        </span>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
