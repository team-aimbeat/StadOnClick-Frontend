import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Info,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  SunMedium,
  X,
} from "lucide-react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import menuHeader from "@/assets/images/banner1.png";
import profile7 from "@/assets/images/profile-7.jpeg";

import { useLogoutMutation } from "@/features/auth/api/authApi";
import { RootState } from "@/app/store";
import {
  toggleRTL,
  toggleSidebar,
  toggleTheme,
} from "@/features/Layout/themeConfigSlice";
import Dropdown from "../shared/dropdown";
import SearchBar from "../shared/SearchBar";
import { clearAuth } from "@/features/auth/authSlice";
import { toast } from "react-hot-toast";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import ModeratorNotificationsBell from "@/components/notifications/ModeratorNotificationsBell";

type MessageItem = {
  id: number;
  name: string;
  message: string;
  time: string;
  count?: number;
  profile: string;
  status?: "online" | "away" | "offline";
};

const AdminHeader = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isRtl = themeConfig.rtlClass === "rtl";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    const selector = document.querySelector<HTMLAnchorElement>(
      `ul.horizontal-menu a[href="${window.location.pathname}"]`,
    );

    if (selector) {
      selector.classList.add("active");
      const activeLinks = document.querySelectorAll<HTMLAnchorElement>(
        "ul.horizontal-menu .nav-link.active",
      );
      activeLinks.forEach((link, index) => {
        if (index > 0) {
          link.classList.remove("active");
        }
      });
    
      
      const nestedMenu = selector.closest("ul.sub-menu");
      if (nestedMenu) {
        const parentMenu = nestedMenu.closest("li.menu");
        const parentLink =
          parentMenu?.querySelector<HTMLAnchorElement>(".nav-link");
        if (parentLink) {
          setTimeout(() => parentLink.classList.add("active"));
        }
      }
    }
  }, [location.pathname]);

  const [flag, setFlag] = useState(themeConfig.locale);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const isAdmin = authUser?.roles?.includes("ADMIN");
  const isSupportAdmin = authUser?.roles?.includes("SUPPORT_ADMIN");
  const isModeratorOnly = authUser?.roles?.includes("MODERATOR") && !isAdmin && !isSupportAdmin;
  const isModeratorShell = location.pathname.startsWith("/admin/moderator");
  const showModeratorNotifications = isModeratorShell || isModeratorOnly;

  const actionBtnClass =
    "group grid h-10 w-10 place-content-center rounded-md mx-2 cursor-pointer border border-gray-200 bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800";

  const getFlagUrl = (code: string) =>
    new URL(`../../assets/flags/${code.toUpperCase()}.svg`, import.meta.url)
      .href;

  const setLocale = (code: string) => {
    setFlag(code);
    if (code.toLowerCase() === "ae") {
      dispatch(toggleRTL("rtl"));
    } else {
      dispatch(toggleRTL("ltr"));
    }
  };

  const removeMessage = (value: number) => {
    setMessages((prev) => prev.filter((message) => message.id !== value));
  };

  const renderThemeToggle = () => {
    if (themeConfig.theme === "light") {
      return (
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => dispatch(toggleTheme("dark"))}
          aria-label={t("Switch to dark mode") || "Switch to dark mode"}
          title={t("Dark")}
        >
          <SunMedium className="h-5 w-5" strokeWidth={1.8} />
        </button>
      );
    }

    if (themeConfig.theme === "dark") {
      return (
        <button
          type="button"
          className={actionBtnClass}
          onClick={() => dispatch(toggleTheme("system"))}
          aria-label={t("Use system theme") || "Use system theme"}
          title={t("System")}
        >
          <Moon className="h-5 w-5" strokeWidth={1.8} />
        </button>
      );
    }

    return (
      <button
        type="button"
        className={actionBtnClass}
        onClick={() => dispatch(toggleTheme("light"))}
        aria-label={t("Switch to light mode") || "Switch to light mode"}
        title={t("Light")}
      >
        <Laptop className="h-5 w-5" strokeWidth={1.8} />
      </button>
    );
  };

  return (
    <header
      className={`sticky top-0 z-40 ${
        themeConfig.semidark && themeConfig.menu === "horizontal" ? "dark" : ""
      }`}
    >
      <div
        className="
          relative flex items-center justify-between gap-3
          px-5 py-3
          bg-white dark:bg-gray-900
          border-b border-gray-200/80 dark:border-gray-800
         min-h-15
        "
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className={actionBtnClass}
            aria-label={t("Toggle sidebar") || "Toggle sidebar"}
            onClick={() => dispatch(toggleSidebar())}
          >
            <Menu className="h-4.5 w-4.5" strokeWidth={1.8} />
          </button>
          <div className="hidden w-full max-w-130 sm:block">
            <SearchBar />
          </div>
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              className={actionBtnClass}
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 text-gray-700 dark:text-[#d0d2d6]">
          {renderThemeToggle()}

          <div className="dropdown shrink-0">
            <Dropdown
              offset={[0, 8]}
              placement={isRtl ? "bottom-start" : "bottom-end"}
              btnClassName={actionBtnClass}
              button={
                <img
                  className="h-5 w-5 rounded-full object-cover"
                  src={getFlagUrl(flag)}
                  alt="language flag"
                />
              }
            >
              <ul className="grid w-70 grid-cols-2 gap-2 px-2 font-semibold text-dark dark:text-white-light/90">
                {themeConfig.languageList.map(
                  (item: { code: string; name: string }) => (
                    <li key={item.code}>
                      <button
                        type="button"
                        className={`flex w-full items-center rounded-lg px-2 py-2 hover:text-primary ${
                          i18next.language === item.code
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          i18next.changeLanguage(item.code);
                          setLocale(item.code);
                        }}
                      >
                        <img
                          src={getFlagUrl(item.code)}
                          alt={`${item.name} flag`}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </Dropdown>
          </div>

          {!showModeratorNotifications && (
            <div className="dropdown shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={isRtl ? "bottom-start" : "bottom-end"}
                btnClassName={actionBtnClass}
                button={<Mail className="h-5 w-5" strokeWidth={1.8} />}
              >
                <ul className="w-[320px] text-dark dark:text-white-dark sm:w-90">
                  <li
                    className="relative h-17.5 overflow-hidden rounded-t-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={menuHeader}
                      alt="Messages header"
                      className="absolute inset-0 h-full w-full object-cover object-center brightness-75"
                    />
                    <div className="relative z-10 flex h-full items-center px-5 text-white">
                      <h4 className="text-lg font-semibold">Messages</h4>
                    </div>
                  </li>
                  <li
                    className="max-h-80 overflow-y-auto divide-y divide-gray-100/80 dark:divide-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {messages.length ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="group flex items-center gap-3 px-5 py-3"
                        >
                          <div className="relative h-11 w-11 flex-none">
                            <img
                              src={message.profile}
                              alt={`${message.name} avatar`}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                            {message.status !== "offline" && (
                              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white dark:ring-gray-900"></span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-5 dark:text-white-light/90">
                              {message.name}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {message.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              {message.time}
                            </span>
                            {message.count ? (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-semibold text-white">
                                {message.count}
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="text-neutral-400 opacity-0 transition hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                            aria-label={t("Dismiss message") || "Dismiss message"}
                            onClick={() => removeMessage(message.id)}
                          >
                            <X className="h-4.5 w-4.5" strokeWidth={1.8} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 px-5 py-8 text-center text-sm">
                        <span className="rounded-full p-3 text-primary ring-4 ring-primary/30">
                          <Info className="h-10 w-10" strokeWidth={1.8} />
                        </span>
                        <p className="text-gray-500 dark:text-gray-400">
                          No data available.
                        </p>
                      </div>
                    )}
                  </li>
                  <li className="px-5 py-3 text-center">
                    <button
                      type="button"
                      className="group inline-flex items-center justify-center text-sm font-semibold text-primary transition hover:underline"
                    >
                      <span className="ltr:mr-1 rtl:ml-1">
                        View all activities
                      </span>
                      <ArrowRight
                        className="h-4.5 w-4.5 transition group-hover:translate-x-1 ltr:ml-1 rtl:mr-1"
                        strokeWidth={1.8}
                      />
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          )}

          <div className="dropdown shrink-0">
            {showModeratorNotifications ? (
              <ModeratorNotificationsBell className={actionBtnClass} />
            ) : (
              <NotificationsBell className={actionBtnClass} />
            )}
          </div>

          <div className="dropdown shrink-0">
            <Dropdown
              offset={[0, 8]}
              placement={isRtl ? "bottom-start" : "bottom-end"}
              btnClassName="group relative rounded-full border border-gray-200/80 bg-white p-0.5 shadow-sm transition hover:border-primary/40 dark:border-gray-700 dark:bg-gray-900/80"
              button={
                <img
                  className="h-9 w-9 rounded-full object-cover saturate-50 transition group-hover:saturate-100"
                  src={profile7}
                  alt="User avatar"
                />
              }
            >
              <ul className="w-57.5 font-semibold text-dark dark:text-white-light/90">
                <li>
                  <div className="flex items-center px-4 py-4">
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={profile7}
                      alt="User avatar"
                    />
                    <div className="ltr:pl-4 rtl:pr-4 truncate">
                      <h4 className="text-base">
                        John Doe
                        <span className="ltr:ml-2 rtl:ml-2 rounded bg-success-light px-1 text-xs text-success">
                          Admin
                        </span>
                      </h4>
                      <button
                        type="button"
                        className="text-sm text-black/60 transition hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
                      >
                        johndoe@gmail.com
                      </button>
                    </div>
                  </div>
                </li>

                <li>
                  <Link
                    to="/auth/boxed-lockscreen"
                    className="flex items-center px-4 py-2 hover:text-primary dark:hover:text-white"
                  >
                    <Lock
                      className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2"
                      strokeWidth={1.8}
                    />
                    Lock Screen
                  </Link>
                </li>
               <li className="border-t border-white-light dark:border-white-light/10">
  <button
    type="button"
    className="flex w-full items-center px-4 py-3 text-danger hover:text-danger"
    disabled={isLoggingOut}
    onClick={async () => {
      try {
        // 1) hit backend to clear cookies
        await logoutApi().unwrap();

        // 2) clear frontend auth state
        dispatch(clearAuth());

        toast.success("Logged out", { id: "admin-logout-success" });

        // 3) go to admin sign-in
        navigate("/admin/sign-in", { replace: true });
      } catch (e) {
        // even if backend fails, clear local state
        dispatch(clearAuth());
        navigate("/admin/sign-in", { replace: true });

        toast.error("Logout failed, cleared local session.", {
          id: "admin-logout-failed",
        });

        console.error("Logout failed", e);
      }
    }}
  >
    <LogOut className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" strokeWidth={1.8} />
    {isLoggingOut ? "Signing out..." : "Sign Out"}
  </button>
</li>

              </ul>
            </Dropdown>
          </div>
        </div>
      </div>
      {searchOpen && (
        <div className="sm:hidden border-b border-gray-200/80 bg-white/95 px-6 pb-3 dark:border-gray-800 dark:bg-black/80">
          <SearchBar />
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
