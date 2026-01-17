import { NavLink } from "react-router-dom";
import {
  HiOutlineBookmarkSquare,
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineTicket,
  HiOutlineClipboardDocumentList,
  HiOutlineEnvelopeOpen,
  HiOutlineWallet,
  HiOutlineMegaphone,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

type MyBusinessPanelProps = {
  className?: string;
};

const items = [
  {
    title: "Business Profile",
    subtitle: "Contact & address",
    to: "/vendor/profile",
    icon: HiOutlineBookmarkSquare,
  },
  {
    title: "Services",
    subtitle: "Catalog & pricing",
    to: "/vendor/services",
    icon: HiOutlineSparkles,
  },
  {
    title: "Photos & Media",
    subtitle: "Upload visuals",
    to: "/vendor/media",
    icon: HiOutlinePhoto,
  },
  {
    title: "Coupons",
    subtitle: "Deals & offers",
    to: "/vendor/coupons",
    icon: HiOutlineTicket,
  },
  {
    title: "Bookings",
    subtitle: "Upcoming & past",
    to: "/vendor/bookings/upcoming",
    icon: HiOutlineClipboardDocumentList,
  },
  {
    title: "Leads",
    subtitle: "Pipeline & sources",
    to: "/vendor/leads",
    icon: HiOutlineEnvelopeOpen,
  },
  {
    title: "Wallet & Payouts",
    subtitle: "Balance & withdrawals",
    to: "/vendor/payouts",
    icon: HiOutlineWallet,
  },
  {
    title: "Subscription Plan",
    subtitle: "Lead quota & renewals",
    to: "/vendor/subscription",
    icon: HiOutlineMegaphone,
  },
];

export default function MyBusinessPanel({ className }: MyBusinessPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5",
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
          return (
            <NavLink
              key={item.title}
              to={item.to}
              className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-blue-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
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

