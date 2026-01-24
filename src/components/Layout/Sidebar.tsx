import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo, useCallback, useRef } from "react";
import type { ComponentType } from "react";

import {
  HiHome,
  HiUserGroup,
  HiClipboardDocumentCheck,
  HiChartBar,
  HiCube,
  HiCog6Tooth,
  HiShieldCheck,
  HiBanknotes,
  HiChevronDown,
  HiInboxStack,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Users } from "lucide-react";

import { RootState } from "@/app/store";
import { toggleSidebar } from "@/features/Layout/themeConfigSlice";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

type SidebarProps = {
  basePath?: string;
};

type NavChild = {
  label: string;
  to: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  badge?: string;
  children?: NavChild[];
};

const Sidebar = ({ basePath = "" }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isCollapsed = !themeConfig.sidebar;
  const isSupportOnly =
    authUser?.roles?.includes("SUPPORT_ADMIN") &&
    !authUser.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r));

  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const normalizedBasePath = basePath.replace(/\/$/, "");
  const withBase = useCallback(
    (path: string) => {
      if (!normalizedBasePath) return path.startsWith("/") ? path : `/${path}`;
      return `${normalizedBasePath}/${path.replace(/^\//, "")}`;
    },
    [normalizedBasePath]
  );

  const navItems: NavItem[] = useMemo(() => {
    if (isSupportOnly) {
      return [
        {
          id: "support-dashboard",
          label: t("Support Dashboard"),
          icon: HiChartBar,
          to: withBase("support/dashboard"),
        },
        {
          id: "support-inbox",
          label: t("Support Inbox"),
          icon: HiInboxStack,
          to: withBase("support/inbox"),
        },
        {
          id: "support-chat",
          label: t("Support Chat"),
          icon: HiChatBubbleLeftRight,
          to: withBase("chat"),
        },
      ];
    }

    return [
      {
        id: "overview",
        label: t("Overview"),
        icon: HiHome,
        to: withBase("dashboard"),
      },
      {
        id: "support-inbox",
        label: t("Support Inbox"),
        icon: HiInboxStack,
        to: withBase("support/inbox"),
      },
      {
        id: "support-dashboard",
        label: t("Support Dashboard"),
        icon: HiChartBar,
        to: withBase("support/dashboard"),
      },
      {
        id: "support-chat",
        label: t("Support Chat"),
        icon: HiChatBubbleLeftRight,
        to: withBase("chat"),
      },
      {
        id: "compliance",
        label: t("Compliance"),
        icon: HiShieldCheck,
        children: [
          { label: t("KYC Review Queue"), to: withBase("compliance/kyc") },
          { label: t("KYC Audit Logs"), to: withBase("compliance/kyc/audit") },
        ],
      },
      {
        id: "leads",
        label: t("Leads & Monetization"),
        icon: HiChartBar,
        children: [
          { label: t("Lead Plans"), to: withBase("leads/plans") },
          { label: t("Vendor Subscriptions"), to: withBase("leads/subscriptions") },
          { label: t("Lead Activity (Coming Soon)"), to: withBase("leads/activity") },
        ],
      },
      {
        id: "bookings",
        label: t("Bookings"),
        icon: HiClipboardDocumentCheck,
        children: [
          { label: t("All Bookings"), to: withBase("bookings") },
          { label: t("Upcoming"), to: withBase("bookings/upcoming") },
          { label: t("Completed"), to: withBase("bookings/completed") },
          { label: t("Refunds"), to: withBase("bookings/refunds") },
        ],
      },
      {
        id: "finance",
        label: t("Finance"),
        icon: HiBanknotes,
        children: [
          { label: t("Payout Requests (Disabled)"), to: withBase("finance/payouts") },
          { label: t("Platform Wallet"), to: withBase("finance/platform-wallet") },
        ],
      },
      {
        id: "catalog",
        label: t("Catalog"),
        icon: HiCube,
        children: [
          { label: t("Interests"), to: withBase("catalog/interests") },
          { label: t("Time Durations"), to: withBase("catalog/time-durations") },
          { label: t("Cities (Read Only)"), to: withBase("catalog/cities") },
        ],
      },
      {
        id: "system",
        label: t("System"),
        icon: HiCog6Tooth,
        children: [
          { label: t("API Health"), to: withBase("system/health") },
          { label: t("API Docs"), to: withBase("system/docs") },
          { label: t("Admin Activity"), to: withBase("system/audit") },
        ],
      },
      {
        id: "administration",
        label: t("Administration"),
        icon: Users,
        children: [{ label: t("Staff"), to: withBase("staff") }],
      },
    ];
  }, [isSupportOnly, t, withBase]);

  const accentPalette = useMemo(
    () => ["#F59E0B", "#22C55E", "#EC4899", "#A855F7", "#0EA5E9", "#F97316", "#10B981"],
    []
  );

  const isPathActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isPathActive(child.to));
    }
    return isPathActive(item.to);
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      if (prev[id]) return {};
      return { [id]: true };
    });
  };

  // Optional: auto-close menu when route changes (uncomment if desired)
  // useEffect(() => {
  //   setOpenMenus({});
  // }, [location.pathname]);

  return (
    <div className="h-full">
      <nav
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-50 bg-white overflow-hidden transform-gpu",
          "transition-[width] duration-300 ease-out will-change-[width]",
          isCollapsed ? "w-[72px]" : "w-[280px]"
        )}
        data-collapsed={isCollapsed}
      >
        {/* Logo / Header */}
        <div className="relative flex items-center justify-center border-b border-slate-100 px-4 py-5 gap-3">
          <div className="absolute left-4 top-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-[#4f7df3]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isCollapsed ? "S" : "StadonClick"}
          </h1>
        </div>

        <PerfectScrollbar className="h-[calc(100vh-88px)]">
          <ul className="px-3 py-5 space-y-1.5 text-sm">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item);
              const isOpen = !!openMenus[item.id];
              const displayActive = active || isOpen;

              return (
                <li key={item.id} className="relative">
                  {item.children ? (
                    <>
                      {/* Parent button */}
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.id)}
                        className={cn(
                          "group flex h-12 w-full items-center rounded-lg px-4 transition-colors",
                          isCollapsed ? "justify-center" : "justify-between",
                          displayActive
                            ? "bg-[#4F7DFF] text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        )}
                      >
                        <div className={cn("flex items-center", isCollapsed ? "" : "gap-3")}>
                          <ItemIcon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="font-semibold tracking-tight">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <HiChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {/* Submenu – using grid for height animation */}
                      {!isCollapsed && (
                        <div
                          className={cn(
                            "grid overflow-hidden transition-all duration-300 ease-in-out",
                            isOpen ? "grid-rows-[1fr] mt-1" : "grid-rows-[0fr] mt-0",
                            isOpen ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <div className="overflow-hidden">
                            <ul className="ml-10 flex flex-col gap-0.5 px-3 pb-3 pt-1">
                              {item.children.map((child, idx) => (
                                <li
                                  key={child.to}
                                  className={cn(
                                    "transition-opacity duration-200",
                                    isOpen ? "opacity-100" : "opacity-0",
                                    isOpen && `delay-[${idx * 30}ms]`
                                  )}
                                >
                                  <NavLink
                                    to={child.to}
                                    className={({ isActive }) =>
                                      cn(
                                        "group flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                                        isActive
                                          ? "bg-blue-50 text-[#4F7DFF] font-semibold"
                                          : "text-slate-600 hover:bg-slate-50 hover:text-[#4F7DFF]"
                                      )
                                    }
                                  >
                                    <span
                                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: accentPalette[idx % accentPalette.length],
                                      }}
                                    />
                                    <span className="truncate">{child.label}</span>
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Single link item */
                    <NavLink
                      to={item.to ?? "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex h-12 w-full items-center rounded-lg px-4 transition-colors",
                          isCollapsed ? "justify-center" : "gap-3",
                          isActive
                            ? "bg-[#4F7DFF] text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        )
                      }
                    >
                      <ItemIcon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-semibold tracking-tight">{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </PerfectScrollbar>
      </nav>
    </div>
  );
};

export default Sidebar;
