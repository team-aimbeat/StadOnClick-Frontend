import PerfectScrollbar from "react-perfect-scrollbar";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo/logo.png";

import {
  HiChevronDown,
  HiChevronLeft,
  HiHome,
  HiDocumentText,
  HiUserGroup,
  HiCalendar,
  HiClipboardDocumentCheck,
  HiChartBar,
  HiCube,
} from "react-icons/hi2";

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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    income: false,
  });
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isCollapsed = !themeConfig.sidebar;

  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const normalizedBasePath = basePath.replace(/\/$/, "");
  const withBase = (path: string) => {
    if (!normalizedBasePath) return path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBasePath}/${path.replace(/^\//, "")}`;
  };
  const dashboardBase = withBase("dashboard");
  const homePath = normalizedBasePath ? dashboardBase : "/";

  useEffect(() => {
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: t("Dashboard"),
      icon: HiHome,
      to: homePath,
    },
    {
      id: "chat",
      label: t("Chat"),
      icon: HiUserGroup,
      to: withBase("chat"),
    },
    {
      id: "kyc",
      label: t("KYC"),
      icon: HiDocumentText,
      to: withBase("kyc"),
    },
    {
      id: "schedules",
      label: t("Schedules"),
      icon: HiCalendar,
      to: withBase("schedules"),
    },
    {
      id: "income",
      label: t("Income"),
      icon: HiClipboardDocumentCheck,
      children: [
        { label: t("Earnings"), to: withBase("income/earnings") },
        { label: t("Refunds"), to: withBase("income/refunds") },
        { label: t("Declines"), to: withBase("income/declines") },
        { label: t("Payouts"), to: withBase("income/payouts") },
      ],
    },
    {
      id: "promote",
      label: t("Promote"),
      icon: HiChartBar,
      to: withBase("promote"),
    },
    {
      id: "components",
      label: t("Components"),
      icon: HiCube,
      to: withBase("components"),
    },
  ];

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
    setOpenMenus((old) => ({ ...old, [value]: !old[value] }));
  };

  return (
    <div className="h-full">
      <nav
        className={cn(
          "sidebar fixed inset-y-0 z-50 bg-white overflow-hidden transform-gpu",
          "transition-[width] duration-200 ease-out will-change-[width]",
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
          <ul className="px-3 py-5 space-y-2 text-sm">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item);
              const isOpen = openMenus[item.id];
              const submenuOpen = !isCollapsed && isOpen;
              return (
                <li key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className={cn(
                          "flex h-[48px] w-full items-center rounded-lg px-4 transition",
                          isCollapsed ? "justify-center" : "justify-between",
                          active
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
                              active ? "text-white" : "text-slate-600"
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
                              active ? "text-white/80" : "text-slate-500",
                              isOpen && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {!isCollapsed && (
                        <ul
                          className={cn(
                            "ml-6 rounded-lg bg-[#dfe5ee] overflow-hidden transition-all duration-200 ease-out origin-top",
                            submenuOpen
                              ? "mt-2 max-h-[320px] opacity-100 translate-y-0 p-2"
                              : "max-h-0 opacity-0 -translate-y-2 p-0"
                          )}
                        >
                          {item.children.map((child) => (
                            <li
                              key={child.label}
                              className={submenuOpen ? "mt-1 first:mt-0" : ""}
                            >
                              <NavLink to={child.to} className="block">
                                {({ isActive }) => (
                                  <div
                                    className={cn(
                                      "flex h-[42px] items-center gap-3 rounded-xl px-3 text-sm transition",
                                      "hover:bg-white/70",
                                      isActive
                                        ? "bg-[#516888] text-slate-900 font-semibold"
                                        : "text-slate-600 font-medium"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={cn(
                                          "h-2.5 w-2.5 rounded-full",
                                          isActive
                                            ? "bg-[#2563EB]"
                                            : "bg-slate-400"
                                        )}
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
