import PerfectScrollbar from "react-perfect-scrollbar";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import AnimateHeight from "react-animate-height";
import { useState, useEffect } from "react";
import logo from "@/assets/logo/logo.png";

import {
  HiChevronDown,
  HiHome,
  HiDocumentText,
  HiUserGroup,
  HiCalendar,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
  HiEnvelope,
  HiRectangleStack,
  HiChartBar,
  HiCube,
  HiMinus,
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
  icon?: IconType;
};

type NavItem = {
  id: string;
  label: string;
  icon: IconType;
  to?: string;
  children?: NavChild[];
};

type NavGroup = {
  id: string;
  label?: string;
  items: NavItem[];
};

const Sidebar = ({ basePath = "" }: SidebarProps) => {
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const semidark = themeConfig.semidark;
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

  const navGroups: NavGroup[] = [
    {
      id: "primary",
      items: [
        {
          id: "dashboard",
          label: t("Dashboard"),
          icon: HiHome,
          to: homePath,
          children: [
            { label: t("Sales"), to: dashboardBase, icon: HiMinus },
            { label: t("Analytics"), to: `${dashboardBase}/analytics`, icon: HiMinus },
            { label: t("Finance"), to: `${dashboardBase}/finance`, icon: HiMinus },
            { label: t("Crypto"), to: `${dashboardBase}/crypto`, icon: HiMinus },
          ],
        },
      ],
    },
    {
      id: "apps",
      label: t("apps"),
      items: [
        { id: "chat", label: t("Chat"), icon: HiChatBubbleLeftRight, to: withBase("chat") },
        { id: "mailbox", label: t("Mailbox"), icon: HiEnvelope, to: withBase("apps/mailbox") },
        { id: "kyc", label: t("KYC"), icon: HiClipboardDocumentCheck, to: withBase("kyc") },
        { id: "notes", label: t("Notes"), icon: HiDocumentText, to: withBase("apps/notes") },
        { id: "scrumboard", label: t("Scrumboard"), icon: HiRectangleStack, to: withBase("apps/scrumboard") },
        { id: "contacts", label: t("Contacts"), icon: HiUserGroup, to: withBase("apps/contacts") },
        { id: "calendar", label: t("Calendar"), icon: HiCalendar, to: withBase("apps/calendar") },
      ],
    },
    {
      id: "ui",
      label: t("user_interface"),
      items: [
        { id: "charts", label: t("Charts"), icon: HiChartBar, to: withBase("charts") },
        { id: "components", label: t("Components"), icon: HiCube, to: withBase("components") },
      ],
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
    setCurrentMenu((old) => (old === value ? "" : value));
  };

  const renderNavItem = (item: NavItem) => {
    const ItemIcon = item.icon;

    if (item.children) {
      return (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition group",
              "text-gray-800 hover:text-primary hover:bg-primary/5",
              isItemActive(item) ? "bg-primary/10 text-blue-500 font-semibold" : ""
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 group-hover:text-primary",
                isItemActive(item) ? "bg-primary/10 text-blue-500" : "bg-slate-50"
              )}
            >
              <ItemIcon className="w-5 h-5" />
            </span>
            {!isCollapsed && (
              <span className="flex-1 text-sm font-medium">{item.label}</span>
            )}
            {!isCollapsed && (
              <HiChevronDown
                className={cn(
                  "w-4 h-4 text-gray-500 transition-transform",
                  currentMenu === item.id && "rotate-180"
                )}
              />
            )}
          </button>

          {!isCollapsed && (
            <AnimateHeight
              duration={220}
              height={currentMenu === item.id ? "auto" : 0}
            >
              <ul className="ml-12 mt-1 space-y-1 text-gray-600">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <li key={child.label}>
                      <NavLink
                        to={child.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-blue-500 font-medium"
                              : "hover:bg-primary/10 hover:text-primary"
                          )
                        }
                      >
                        {ChildIcon && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-gray-500">
                            <ChildIcon className="w-4 h-4" />
                          </span>
                        )}
                        <span>{child.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </AnimateHeight>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <NavLink
          to={item.to ?? "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition group",
              "text-gray-800 hover:text-primary hover:bg-primary/5",
              isActive ? "bg-primary/10 text-blue-500 font-semibold" : ""
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-gray-500",
                  isActive ? "bg-primary/10 text-blue-600" : "bg-slate-50"
                )}
              >
                <ItemIcon className="w-5 h-5" />
              </span>
              {!isCollapsed && (
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              )}
            </>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={cn(
          "sidebar fixed inset-y-0 z-50 my-4 lg:my-3",
          "transition-all duration-300 ease-in-out",
          "bg-white dark:bg-black rounded-3xl border border-white/70 dark:border-gray-900",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <NavLink to={homePath} className="flex items-center justify-center">
            <img src={logo} className={isCollapsed ? "w-8" : "w-25 ml-10"} alt="logo" />
          </NavLink>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={isCollapsed ? t("Expand") : t("Collapse")}
          >
            <HiChevronDown className="rotate-90 w-5 h-5 text-gray-500" />
          </button>
        </div>

        <PerfectScrollbar className="h-[calc(100vh-96px)]">
          <div className="px-3 py-4 space-y-4 text-sm">
            {navGroups.map((group) => (
              <div key={group.id} className={cn("space-y-2")}>
                {!isCollapsed && group.label && (
                  <div
                    className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase
                               text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                  >
                    {group.label}
                  </div>
                )}
                <ul className="space-y-1">
                  {group.items.map(renderNavItem)}
                </ul>
              </div>
            ))}
          </div>
        </PerfectScrollbar>
      </nav>
    </div>
  );
};

export default Sidebar;
