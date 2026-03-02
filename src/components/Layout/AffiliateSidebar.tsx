import { NavLink } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import {
  HiOutlineChartBarSquare,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineWallet,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
} from "react-icons/hi2";

import { cn } from "@/lib/utils";

type AffiliateNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AffiliateNavGroup = {
  label: string;
  items: AffiliateNavItem[];
};

const navGroups: AffiliateNavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Overview", to: "/affiliate/overview", icon: HiOutlineChartBarSquare },
      { label: "Referrals", to: "/affiliate/referrals", icon: HiOutlineArrowPathRoundedSquare },
      { label: "Vendors Referred", to: "/affiliate/vendors-referred", icon: HiOutlineUserGroup },
    ],
  },
  {
    label: "EARNINGS",
    items: [
      { label: "Commission", to: "/affiliate/commission", icon: HiOutlineCurrencyDollar },
      { label: "Wallet", to: "/affiliate/wallet", icon: HiOutlineWallet },
      { label: "Payouts", to: "/affiliate/payouts", icon: HiOutlineBanknotes },
      { label: "Payout Setup", to: "/affiliate/stripe", icon: HiOutlineCreditCard },
    ],
  },
];

export default function AffiliateSidebar() {
  return (
    <aside className="sidebar hidden lg:block fixed inset-y-0 z-40 w-65 border-r border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">StadonClick Affiliate</p>
          <p className="text-[11px] text-slate-500">Growth workspace</p>
        </div>
      </div>

      <PerfectScrollbar className="h-[calc(100vh-72px)]">
        <div className="mt-3 space-y-6 px-3 pb-6">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold tracking-[0.15em] text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50",
                          isActive && "border-l-4 border-blue-500 bg-blue-50 text-blue-700",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-md border border-slate-200",
                              isActive && "border-blue-200 bg-white text-blue-700",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PerfectScrollbar>
    </aside>
  );
}
