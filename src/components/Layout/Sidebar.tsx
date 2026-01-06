import PerfectScrollbar from "react-perfect-scrollbar";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import AnimateHeight from "react-animate-height";
import { useState, useEffect } from "react";

import {
  HiChevronDown,
  HiChevronRight,
  HiMinus,
  HiHome,
  HiChatBubbleLeftRight,
  HiEnvelope,
  HiClipboardDocumentCheck,
  HiDocumentText,
  HiRectangleStack,
  HiUserGroup,
  HiBanknotes,
  HiCalendar,
  HiCube,
  HiChartBar,
} from "react-icons/hi2";

import { IRootState } from "@/app/store";
import { toggleSidebar } from "@/features/Layout/themeConfigSlice";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = themeConfig.semidark;
  const isCollapsed = !themeConfig.sidebar;

  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const toggleMenu = (value: string) => {
    setCurrentMenu((old) => (old === value ? "" : value));
  };

  useEffect(() => {
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [location]);

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={cn(
          "sidebar fixed inset-y-0 z-50 my-4 lg:my-3",
          "transition-all duration-300 ease-in-out",
          "bg-white dark:bg-black rounded-2xl shadow-md",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <NavLink to="/" className="flex items-center justify-center">
            <img
              src="src/assets/logo/logo.png"
              className={isCollapsed ? "w-8" : "w-32"}
              alt="logo"
            />
          </NavLink>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <HiChevronDown className="rotate-90 w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Menu */}
        <PerfectScrollbar className="h-[calc(100vh-80px)]">
          <ul className="px-3 py-4 space-y-1 text-sm">

            {/* Dashboard */}
            <li>
              <button
                onClick={() => toggleMenu("dashboard")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg",
                  "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  "transition group",
                  currentMenu === "dashboard" && "bg-[#3289ff1a] text-primary"
                )}
              >
                <div className="flex items-center">
                  <HiHome className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-primary" />
                  {!isCollapsed && <span className="ml-3">{t("Dashboard")}</span>}
                </div>
                {!isCollapsed && (
                  <HiChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      currentMenu === "dashboard" && "rotate-90"
                    )}
                  />
                )}
              </button>

              <AnimateHeight
                duration={250}
                height={currentMenu === "dashboard" && !isCollapsed ? "auto" : 0}
              >
                <ul className="ml-10 mt-1 space-y-1 text-gray-500">
                  {["Sales", "Analytics", "Finance", "Crypto"].map((item) => (
                    <li key={item}>
                      <NavLink
                        to={`/${item === "sales" ? "" : item}`}
                        className="block px-3 py-2 rounded-md
                                   hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {t(item)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </AnimateHeight>
            </li>

            {/* Section: Apps */}
            {!isCollapsed && (
              <h2 className="px-4 pt-5 pb-2 text-[11px] font-semibold tracking-wider uppercase
                             text-black-500 bg-gray-100 dark:text-gray-400 font-inter">
                {t("apps")}
              </h2>
            )}

            {[
              { to: "/apps/chat", icon: HiChatBubbleLeftRight,  label: "Chat" },
              { to: "/apps/mailbox", icon: HiEnvelope, label: "Mailbox" },
              { to: "/apps/todolist", icon: HiClipboardDocumentCheck, label: "Todo_list" },
              { to: "/apps/notes", icon: HiDocumentText, label: "Notes" },
              { to: "/apps/scrumboard", icon: HiRectangleStack, label: "Scrumboard" },
              { to: "/apps/contacts", icon: HiUserGroup, label: "Contacts" },
              { to: "/apps/calendar", icon: HiCalendar, label: "Calendar" },
            ].map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition group",
                      isActive
                        ? "bg-[#3289ff1a] text-primary"
                        : "text-gray-700 dark:text-gray-400 text hover:bg-gray-100 dark:hover:bg-gray-800"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  {!isCollapsed && <span className="ml-3">{t(item.label)}</span>}
                </NavLink>
              </li>
            ))}

            {/* Section: UI */}
            {!isCollapsed && (
              <h2 className="px-3 pt-5 pb-2 text-[11px] font-semibold tracking-wider uppercase
                             text-black-500  bg-gray-100  dark:text-gray-400 font-inter">
                {t("user_interface")}
              </h2>
            )}

            <li>
              <NavLink
                to="/charts"
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition group",
                    isActive
                      ? "bg-[#3289ff1a] text-primary"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )
                }
              >
                <HiChartBar className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                {!isCollapsed && <span className="ml-3">{t("Charts")}</span>}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/components"
                className="flex items-center px-3 py-2.5 rounded-lg
                           text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HiCube className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                {!isCollapsed && <span className="ml-3">{t("Components")}</span>}
              </NavLink>
            </li>

          </ul>
        </PerfectScrollbar>
      </nav>
    </div>
  );
};

export default Sidebar;
