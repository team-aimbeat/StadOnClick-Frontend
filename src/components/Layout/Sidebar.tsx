import { skipToken } from "@reduxjs/toolkit/query";
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
  HiBookOpen,
  HiInboxStack,
  HiChatBubbleLeftRight,
  HiBell,
  HiDocumentText,
  HiTag,
} from "react-icons/hi2";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Activity, Users } from "lucide-react";

import { RootState } from "@/app/store";
import { useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import { useGetAllVendorKycDocumentsQuery } from "@/services/adminKycApi";
import { toggleSidebar } from "@/features/Layout/themeConfigSlice";
import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

type SidebarProps = {
  basePath?: string;
};

type NavChild = {
  label: string;
  to: string;
  badge?: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  badge?: string;
  children?: NavChild[];
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Sidebar = ({ basePath = "/admin" }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isCollapsed = !themeConfig.sidebar;
  const isAdmin = authUser?.roles?.includes("ADMIN");
  const isModerator = authUser?.roles?.includes("MODERATOR");
  const isSupportAdmin = authUser?.roles?.includes("SUPPORT_ADMIN");
  const isSupportOnly = Boolean(isSupportAdmin && !isAdmin && !isModerator);
  const isModeratorOnly = Boolean(isModerator && !isAdmin && !isSupportAdmin);

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

  const shouldLoadAdminBookingCounts = Boolean(isAdmin && !isSupportOnly && !isModeratorOnly);

  const { data: allBookingsCountResponse } = useListAdminBookingsQuery(
    shouldLoadAdminBookingCounts ? { page: 1, limit: 1 } : skipToken
  );
  const { data: upcomingBookingsCountResponse } = useListAdminBookingsQuery(
    shouldLoadAdminBookingCounts
      ? { page: 1, limit: 1, statuses: "CONFIRMED,PENDING" }
      : skipToken
  );
  const { data: completedBookingsCountResponse } = useListAdminBookingsQuery(
    shouldLoadAdminBookingCounts
      ? { page: 1, limit: 1, statuses: "COMPLETED" }
      : skipToken
  );
  const { data: refundBookingsCountResponse } = useListAdminBookingsQuery(
    shouldLoadAdminBookingCounts
      ? { page: 1, limit: 1, statuses: "REFUND_REQUESTED" }
      : skipToken
  );
  const { data: vendorKycDocuments } = useGetAllVendorKycDocumentsQuery(
    isAdmin && !isSupportOnly && !isModeratorOnly ? undefined : skipToken
  );

  const bookingNavBadges = useMemo(
    () => ({
      all: String(allBookingsCountResponse?.meta?.total ?? 0),
      upcoming: String(upcomingBookingsCountResponse?.meta?.total ?? 0),
      completed: String(completedBookingsCountResponse?.meta?.total ?? 0),
      refunds: String(refundBookingsCountResponse?.meta?.total ?? 0),
    }),
    [
      allBookingsCountResponse?.meta?.total,
      upcomingBookingsCountResponse?.meta?.total,
      completedBookingsCountResponse?.meta?.total,
      refundBookingsCountResponse?.meta?.total,
    ]
  );

  const pendingKycCount = useMemo(
    () =>
      (vendorKycDocuments ?? []).filter(
        (doc) => String(doc.status ?? "").toUpperCase() === "PENDING"
      ).length,
    [vendorKycDocuments]
  );

  const navItems: NavItem[] = useMemo(() => {
    if (isSupportOnly) {
      return [
        {
          id: "support-dashboard",
          label: t("Support Dashboard"),
          icon: HiChartBar,
          to: withBase("support-dashboard"),
        },
        {
          id: "support-inbox",
          label: t("Support Inbox"),
          icon: HiInboxStack,
          to: withBase("support-inbox"),
        },
        {
          id: "support-chat",
          label: t("Support Chat"),
          icon: HiChatBubbleLeftRight,
          to: withBase("support-chat"),
        },
        {
          id: "system-health",
          label: t("System Health"),
          icon: Activity,
          to: withBase("system/health"),
        },
      ];
    }

    if (isModeratorOnly) {
      return [
        {
          id: "moderator-dashboard",
          label: t("Moderator Dashboard"),
          icon: HiChartBar,
          to: withBase("moderator/dashboard"),
        },
        {
          id: "moderator-escalations",
          label: t("Escalations"),
          icon: HiInboxStack,
          to: withBase("moderator/escalations"),
        },
        {
          id: "moderator-notifications",
          label: t("Notifications"),
          icon: HiBell,
          to: withBase("moderator/notifications"),
        },
        {
          id: "system-health",
          label: t("System Health"),
          icon: Activity,
          to: withBase("system/health"),
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
        id: "vendor-management",
        label: t("Vendor"),
        icon: Users,
        children: [
          { label: t("Vendors"), to: withBase("vendors") },
          { label: t("Vendor Services"), to: withBase("services") },
          { label: t("Offerings"), to: withBase("offerings") },
        ],
      },
         {
        id: "customers-management",
        label: t("Customers"),
        icon: HiUserGroup,
        children: [{ label: t("Customers"), to: withBase("customers") }],
      },
    
      {
        id: "users-management",
        label: t("Users"),
        icon: HiUserGroup,
        children: [
          { label: t("Staff Users"), to: withBase("staff") },
          { label: t("Affiliate Users"), to: withBase("affiliates") },
        ],
      },
         {
        id: "service_master",
        label: t("Service master"),
        icon: HiClipboardDocumentCheck,
        children: [
    { label: t("Service Masters"), to: withBase("catalog/service-categories") },
        ],
      },
      {
        id: "bookings",
        label: t("Bookings"),
        icon: HiClipboardDocumentCheck,
        badge: bookingNavBadges.upcoming,
        children: [
          { label: t("All Bookings"), to: withBase("bookings"), badge: bookingNavBadges.all },
          { label: t("Upcoming"), to: withBase("bookings/upcoming"), badge: bookingNavBadges.upcoming },
          { label: t("Completed"), to: withBase("bookings/completed"), badge: bookingNavBadges.completed },
          { label: t("Refunds"), to: withBase("bookings/refunds"), badge: bookingNavBadges.refunds },
          { label: t("Booking Logs"), to: withBase("booking-logs") },
        ],
      },
      {
        id: "orders",
        label: t("Orders"),
        icon: HiDocumentText,
        to: withBase("orders"),
      },
    
      ...(isModerator
        ? [
            {
              id: "moderator-dashboard",
              label: t("Moderator Dashboard"),
              icon: HiChartBar,
              to: withBase("moderator/dashboard"),
            },
            {
              id: "moderator-escalations",
              label: t("Escalations"),
              icon: HiInboxStack,
              to: withBase("moderator/escalations"),
            },
            {
              id: "moderator-notifications",
              label: t("Notifications"),
              icon: HiBell,
              to: withBase("moderator/notifications"),
            },
          ]
        : []),
      {
        id: "compliance",
        label: t("Compliance"),
        icon: HiShieldCheck,
        badge: pendingKycCount > 0 ? String(pendingKycCount) : undefined,
        children: [
          {
            label: t("KYC Review Queue"),
            to: withBase("compliance/kyc"),
            badge: pendingKycCount > 0 ? String(pendingKycCount) : undefined,
          },
          { label: t("KYC Audit Logs"), to: withBase("compliance/kyc/audit") },
        ],
      },
      {
        id: "leads",
        label: t("Leads & Monetization"),
        icon: HiChartBar,
        children: [
          { label: t("Lead Plans"), to: withBase("leads/plans") },
          { label: t("Coupons"), to: withBase("coupons") },
          { label: t("Subscription Plans"), to: withBase("subscription-plans") },
          { label: t("Vendor Subscriptions"), to: withBase("leads/subscriptions") },
          { label: t("Sponsorship Plans"), to: withBase("finance/sponsorship-plans") },
        ],
      },
       {
        id: "layout-studio",
        label: t("Layout Studio"),
        icon: HiCube,
        children: [
          // { label: t("Home Sections Studio"), to: withBase("layout-studio/home-sections") },
          { label: t("Hero Section"), to: withBase("layout-studio/home-sections/hero") },
          { label: t("Best Deals Section"), to: withBase("layout-studio/home-sections/best-deals") },
          { label: t("Extra Deals Section"), to: withBase("layout-studio/home-sections/extra-deals") },
          { label: t("Trending Section"), to: withBase("layout-studio/home-sections/trending") },
          { label: t("Blogs Section"), to: withBase("layout-studio/home-sections/blogs") },
          { label: t("Advertisment Section"), to: withBase("layout-studio/home-sections/other") },
          { label: t("Header Section"), to: withBase("layout-studio/header-sections") },
          { label: t("Header Dropdown"), to: withBase("layout-studio/header-dropdown") },
          { label: t("Footer Section"), to: withBase("layout-studio/footer-sections") },
        ],
      },
      {
        id: "coupons",
        label: t("Coupons"),
        icon: HiTag,
        to: withBase("coupons"),
      },
    
      {
        id: "finance",
        label: t("Finance"),
        icon: HiBanknotes,
        children: [
          { label: t("Payout Requests (Disabled)"), to: withBase("finance/payouts") },
          { label: t("Platform Wallet"), to: withBase("finance/platform-wallet") },
          { label: t("Payment Logs"), to: withBase("finance/payment-logs") },
        ],
      },
      {
        id: "help",
        label: t("Help & User Manual"),
        icon: HiBookOpen,
        to: withBase("help/user-manual"),
      },
        {
        id: "support-inbox",
        label: t("Support Inbox"),
        icon: HiInboxStack,
        to: withBase("support-inbox"),
      },
      {
        id: "support-dashboard",
        label: t("Support Dashboard"),
        icon: HiChartBar,
        to: withBase("support-dashboard"),
      },
      {
        id: "support-chat",
        label: t("Support Chat"),
        icon: HiChatBubbleLeftRight,
        to: withBase("support-chat"),
      },
      {
        id: "catalog",
        label: t("Catalog"),
        icon: HiCube,
        children: [
          { label: t("Preference Studio"), to: withBase("catalog/interests") },
        ],
      },
     
      {
        id: "system",
        label: t("System"),
        icon: HiCog6Tooth,
        children: [
          { label: t("Reports"), to: withBase("reports") },
          { label: t("Account Settings"), to: withBase("account-settings") },
          { label: t("Platform Settings"), to: withBase("settings") },
          { label: t("API Docs"), to: withBase("system/docs") },
          { label: t("Admin Activity"), to: withBase("system/audit") },
        ],
      },
   
      {
        id: "system-health",
        label: t("System Health"),
        icon: Activity,
        to: withBase("system/health"),
      },
    ];
  }, [
    bookingNavBadges.all,
    bookingNavBadges.completed,
    bookingNavBadges.refunds,
    bookingNavBadges.upcoming,
    isModerator,
    isModeratorOnly,
    isSupportOnly,
    t,
    withBase,
  ]);

  const accentPalette = useMemo(
    () => ["#F59E0B", "#22C55E", "#EC4899", "#A855F7", "#0EA5E9", "#F97316", "#10B981"],
    []
  );

  const isPathActive = (path?: string) => {
    if (!path) return false;
    // Exact match for the base route, OR it's a sub-route (e.g. /admin/coupons/new)
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
              const isComplianceBadge = item.id === "compliance";

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
                          <div className="ml-auto flex items-center gap-2">
                            {item.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                  isComplianceBadge
                                    ? displayActive
                                      ? "bg-emerald-500/20 text-white"
                                      : "bg-emerald-50 text-emerald-600"
                                    : displayActive
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            <HiChevronDown
                              className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                isOpen && "rotate-180"
                              )}
                            />
                          </div>
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
                              {item.children.map((child, idx) => {
                                const accentColor = accentPalette[idx % accentPalette.length];

                                return (
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
                                      end={child.to === withBase("bookings")}
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
                                          backgroundColor: accentColor,
                                        }}
                                      />
                                      <span className="truncate">{child.label}</span>
                                      {child.badge && (
                                        <span
                                          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                                          style={{
                                            backgroundColor:
                                              child.to === withBase("compliance/kyc")
                                                ? hexToRgba("#059669", 0.14)
                                                : hexToRgba(accentColor, 0.14),
                                            color:
                                              child.to === withBase("compliance/kyc")
                                                ? "#059669"
                                                : accentColor,
                                          }}
                                        >
                                          {child.badge}
                                        </span>
                                      )}
                                    </NavLink>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Single link item */
                    <NavLink
                      to={item.to ?? "/"}
                      className={() =>
                        cn(
                          "flex h-12 w-full items-center rounded-lg px-4 transition-colors",
                          isCollapsed ? "justify-center" : "gap-3",
                          active
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
