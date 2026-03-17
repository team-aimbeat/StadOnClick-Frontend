import { Link } from "react-router-dom";
import { ShieldUser, Store, UserRound } from "lucide-react";

type PortalKey = "customer" | "vendor" | "admin";

type PortalSwitcherProps = {
  current: PortalKey;
};

const portalItems: Array<{
  key: PortalKey;
  label: string;
  description: string;
  href: string;
  icon: typeof UserRound;
}> = [
  {
    key: "customer",
    label: "Customer",
    description: "Bookings and profile",
    href: "/sign-in",
    icon: UserRound,
  },
  {
    key: "vendor",
    label: "Vendor",
    description: "Business operations",
    href: "/vendor/sign-in",
    icon: Store,
  },
  {
    key: "admin",
    label: "Admin",
    description: "Platform console",
    href: "/admin/sign-in",
    icon: ShieldUser,
  },
];

export function PortalSwitcher({ current }: PortalSwitcherProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Choose Portal
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {portalItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === current;

          return (
            <Link
              key={item.key}
              to={item.href}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                isActive
                  ? "border-[#0b59a2] bg-[#0b59a2] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                  isActive ? "bg-white/20" : "bg-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-700"}`} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`block text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
