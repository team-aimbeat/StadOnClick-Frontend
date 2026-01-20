import { NavLink } from "react-router-dom";
import {
  HiOutlineChevronRight,
} from "react-icons/hi2";
import {
  Bookmark,
  Sparkles,
  Image as LucideImage,
  TicketPercent,
  ClipboardList,
  Mail,
  Wallet2,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MyBusinessPanelProps = {
  className?: string;
};

const items = [
  {
    title: "Business Profile",
    subtitle: "Contact & address",
    to: "/vendor/profile",
    icon: Bookmark,
    tone: "violet" as const,
  },
  {
    title: "Services",
    subtitle: "Catalog & pricing",
    to: "/vendor/services",
    icon: Sparkles,
    tone: "blue" as const,
  },
  {
    title: "Photos & Media",
    subtitle: "Upload visuals",
    to: "/vendor/media",
    icon: LucideImage,
    tone: "rose" as const,
  },
  {
    title: "Coupons",
    subtitle: "Deals & offers",
    to: "/vendor/coupons",
    icon: TicketPercent,
    tone: "amber" as const,
  },
  {
    title: "Bookings",
    subtitle: "Upcoming & past",
    to: "/vendor/bookings/upcoming",
    icon: ClipboardList,
    tone: "slate" as const,
  },
  {
    title: "Leads",
    subtitle: "Pipeline & sources",
    to: "/vendor/leads",
    icon: Mail,
    tone: "blue" as const,
  },
  {
    title: "Wallet & Payouts",
    subtitle: "Balance & withdrawals",
    to: "/vendor/payouts",
    icon: Wallet2,
    tone: "emerald" as const,
  },
  {
    title: "Subscription Plan",
    subtitle: "Lead quota & renewals",
    to: "/vendor/subscription",
    icon: Megaphone,
    tone: "violet" as const,
  },
];

export default function MyBusinessPanel({ className }: MyBusinessPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-slate-900">My Business</p>
          <p className="text-sm text-slate-500">
            Manage leads, bookings, profile, and monetization
          </p>
        </div>
        <NavLink
          to="/vendor/profile"
          className="text-xs font-semibold text-blue-600 hover:text-blue-500"
        >
          View all 
        </NavLink>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          const toneClass = {
            violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
            blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
            rose: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
            amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
            slate: "bg-slate-100 text-slate-700 group-hover:bg-slate-200",
            emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
          } as const;
          return (
            <NavLink
              key={item.title}
              to={item.to}
              className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full transition-colors",
                    toneClass[item.tone]
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </span>
              </span>
              <HiOutlineChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600" />
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
