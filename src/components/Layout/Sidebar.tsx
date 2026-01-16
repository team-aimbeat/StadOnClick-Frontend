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
          "sidebar fixed inset-y-0 z-50 ",
          "transition-all duration-300 ease-in-out",
          "bg-white ",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="relative flex items-center justify-center border border-slate-100 px-4 py-[18.5px] gap-3">
          <div className="absolute left-4 top-3 flex items-center gap-2 ">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-[#4f7df3]" />
          </div>
          <h1 className="text-2xl font-semibold">StadonClick</h1>
        </div>

        <PerfectScrollbar className="h-[calc(100vh-104px)]">
          <ul className="px-3 py-5 space-y-2 text-sm">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item);
              return (
                <li key={item.id}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                          active
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-2xl",
                            active
                              ? "bg-white text-slate-900 shadow"
                              : "bg-slate-50"
                          )}
                        >
                          <ItemIcon className="h-5 w-5" />
                        </span>
                        {!isCollapsed && (
                          <span className="flex-1 text-sm font-semibold">
                            {item.label}
                          </span>
                        )}
                        {!isCollapsed && (
                          <HiChevronDown
                            className={cn(
                              "h-5 w-5 text-slate-400 transition-transform",
                              openMenus[item.id] && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {!isCollapsed && openMenus[item.id] && (
                        <ul className="mt-1 space-y-1 pl-12 text-xs font-medium tracking-wide text-slate-500">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <NavLink
                                to={child.to}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center gap-2 rounded-2xl px-3 py-1 hover:text-slate-900 hover:bg-slate-100",
                                    isActive ? "text-slate-900 bg-slate-50" : ""
                                  )
                                }
                              >
                                {child.label}
                                <span className="ml-auto text-[10px] uppercase tracking-[0.4em] text-slate-400">
                                  →
                                </span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.to ?? "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
                          isActive
                            ? "bg-blue-400 text-white"
                            : "text-slate-500 hover:text-slate-900"
                        )
                      }
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl",
                          "bg-slate-50 text-slate-500"
                        )}
                      >
                        <ItemIcon className="h-5 w-5" />
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-semibold">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="rounded-full bg-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-500">
                              {item.badge}
                            </span>
                          )}
                        </>
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
