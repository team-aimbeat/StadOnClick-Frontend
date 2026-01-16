import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import {
  HiHome,
  HiUserGroup,
  HiClipboardDocumentCheck,
  HiDocumentText,
  HiChartBar,
  HiCube,
  HiCog6Tooth,
  HiShieldCheck,
  HiBanknotes,
  HiSparkles,
  HiChevronDown,
} from "react-icons/hi2";
import PerfectScrollbar from "react-perfect-scrollbar";

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
  icon: IconType;
  to?: string;
  badge?: string;
  children?: NavChild[];
};

const Sidebar = ({ basePath = "" }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [submenuHeights, setSubmenuHeights] = useState<Record<string, number>>({});
  const listRef = useRef<HTMLUListElement | null>(null);
  const menuRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const submenuRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isCollapsed = !themeConfig.sidebar;

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
  const homePath = normalizedBasePath ? withBase("dashboard") : "/";

  useEffect(() => {
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const navItems: NavItem[] = [
    // =========================
    // OVERVIEW
    // =========================
    {
      id: "overview",
      label: t("Overview"),
      icon: HiHome,
      to: withBase("dashboard"),
    },

    // =========================
    // VENDOR OPERATIONS
    // =========================
    {
      id: "vendors",
      label: t("Vendors"),
      icon: HiUserGroup,
      children: [
        { label: t("All Vendors"), to: withBase("vendors") },
        { label: t("Vendor Applications"), to: withBase("vendors/applications") },
        { label: t("Vendor Staff (Coming Soon)"), to: withBase("vendors/staff") },
      ],
    },

    // =========================
    // COMPLIANCE (KYC + REVIEW)
    // =========================
    {
      id: "compliance",
      label: t("Compliance"),
      icon: HiShieldCheck,
      children: [
        { label: t("KYC Review Queue"), to: withBase("compliance/kyc") },
        { label: t("KYC Audit Logs"), to: withBase("compliance/kyc/audit") },
      ],
    },

    // =========================
    // LEADS & MONETIZATION
    // =========================
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

    // =========================
    // PAYOUTS / FINANCE (future-ready)
    // =========================
    {
      id: "finance",
      label: t("Finance"),
      icon: HiBanknotes,
      children: [
        { label: t("Payout Requests (Disabled)"), to: withBase("finance/payouts") },
        { label: t("Platform Wallet (Coming Soon)"), to: withBase("finance/platform-wallet") },
      ],
    },

    // =========================
    // CATALOG / CONFIGURATION
    // =========================
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

    // =========================
    // SYSTEM
    // =========================
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
  ];

  const accentPalette = useMemo(
    () => ["#F59E0B", "#22C55E", "#EC4899", "#A855F7", "#0EA5E9", "#F97316", "#10B981"],
    []
  );

  useEffect(() => {
    const openId = Object.keys(openMenus).find((key) => openMenus[key]);
    if (!openId) return;
    const target = menuRefs.current[openId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const submenu = submenuRefs.current[openId];
    if (submenu) {
      const nextHeight = submenu.scrollHeight;
      setSubmenuHeights((prev) =>
        prev[openId] === nextHeight ? prev : { ...prev, [openId]: nextHeight }
      );
    }
  }, [openMenus]);

  useEffect(() => {
    const handleResize = () => {
      const openId = Object.keys(openMenus).find((key) => openMenus[key]);
      if (!openId) return;
      const submenu = submenuRefs.current[openId];
      if (!submenu) return;
      const nextHeight = submenu.scrollHeight;
      setSubmenuHeights((prev) =>
        prev[openId] === nextHeight ? prev : { ...prev, [openId]: nextHeight }
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [openMenus]);

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

  const toggleMenu = (value: string) => {
    setOpenMenus((old) => {
      const isAlreadyOpen = !!old[value];
      if (isAlreadyOpen) return {};
      return { [value]: true };
    });
  };

  return (
    <div className="h-full">
      <nav
        className={cn(
          "sidebar fixed inset-y-0 z-50 bg-white overflow-hidden transform-gpu",
          "transition-[width] duration-300 ease-out will-change-[width]",
          isCollapsed ? "w-[72px]" : "w-[280px]"
        )}
        data-collapsed={isCollapsed}
      >
        <div className="relative flex items-center justify-center border border-slate-100 px-4 py-[18.5px] gap-3">
          <div className="absolute left-4 top-3 flex items-center gap-2 ">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-[#4f7df3]" />
          </div>
          <h1 className="text-2xl font-semibold">
            {isCollapsed ? "S" : "StadonClick"}
          </h1>
        </div>

        <PerfectScrollbar className="h-[calc(100vh-104px)] will-change-transform">
          <ul ref={listRef} className="px-3 py-5 space-y-2 text-sm">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item);
              const isOpen = openMenus[item.id];
              const displayActive = active || isOpen;
              const submenuOpen = !isCollapsed && isOpen;
              const submenuHeight = submenuHeights[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  ref={(node) => {
                    menuRefs.current[item.id] = node;
                  }}
                >
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className={cn(
                          "flex h-[48px] w-full items-center rounded-lg px-4 transition",
                          isCollapsed ? "justify-center" : "justify-between",
                          displayActive
                            ? "bg-[#4F7DFF] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                        onClick={() => toggleMenu(item.id)}
                      >
                        <div
                          className={cn(
                            "flex items-center transition-[gap] duration-150",
                            isCollapsed ? "gap-0" : "gap-3"
                          )}
                        >
                          <ItemIcon
                            className={cn(
                              "h-5 w-5",
                              displayActive ? "text-white" : "text-slate-600"
                            )}
                          />
                          <span className="sidebar-text text-sm font-semibold">
                            {item.label}
                          </span>
                        </div>
                        {!isCollapsed && (
                          <HiChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform",
                              displayActive
                                ? "text-white/80"
                                : "text-slate-500",
                              isOpen && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {!isCollapsed && (
                        <ul
                          ref={(node) => {
                            submenuRefs.current[item.id] = node;
                          }}
                          className={cn(
                            "ml-6 overflow-hidden transform-gpu transition-[max-height,opacity,transform,padding] duration-300 ease-in-out origin-top",
                            submenuOpen
                              ? "mt-2 opacity-100 translate-y-0 p-2"
                              : "opacity-0 -translate-y-2 p-0"
                          )}
                          style={{ maxHeight: submenuOpen ? `${submenuHeight}px` : "0px" }}
                        >
                          {item.children.map((child, idx) => (
                            <li
                              key={child.label}
                              className={cn(
                                "transition-[opacity,transform,margin] duration-250 ease-in-out",
                                submenuOpen
                                  ? "mt-1 first:mt-0 translate-y-0 opacity-100"
                                  : "translate-y-2 opacity-0"
                              )}
                              style={{
                                transitionDelay: submenuOpen
                                  ? `${idx * 40}ms`
                                  : "0ms",
                              }}
                            >
                              <NavLink to={child.to} className="block group">
                                {({ isActive }) => (
                                  <div
                                    className={cn(
                                      "flex h-[42px] items-center gap-3 rounded-xl px-3 text-sm transition",
                                      "text-slate-600 font-medium",
                                      "group-hover:text-[#4F7DFF]",
                                      isActive && "text-[#4F7DFF] font-semibold"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        style={{
                                          ["--dot-color" as string]:
                                            accentPalette[idx % accentPalette.length],
                                        }}
                                        className="h-2.5 w-2.5 rounded-full transition-colors bg-[var(--dot-color)] group-hover:bg-[#4F7DFF] data-[active=true]:bg-[#4F7DFF]"
                                        data-active={isActive}
                                      />
                                      <span className="font-semibold">{child.label}</span>
                                    </div>
                                  </div>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink to={item.to ?? "/"} className="block">
                      {({ isActive }) => (
                        <div
                          className={cn(
                            "flex h-[48px] w-full items-center rounded-lg px-4 transition",
                            isCollapsed
                              ? "justify-center"
                              : "justify-start gap-3",
                            isActive
                              ? "bg-[#4F7DFF] text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center transition-[gap] duration-150",
                              isCollapsed ? "gap-0" : "gap-3"
                            )}
                          >
                            <ItemIcon
                              className={cn(
                                "h-5 w-5",
                                isActive ? "text-white" : "text-slate-600"
                              )}
                            />
                            <span className="sidebar-text text-sm font-semibold">
                              {item.label}
                            </span>
                          </div>
                          {!isCollapsed && item.badge && (
                            <span className="rounded-full bg-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-500">
                              {item.badge}
                            </span>
                          )}
                        </div>
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
