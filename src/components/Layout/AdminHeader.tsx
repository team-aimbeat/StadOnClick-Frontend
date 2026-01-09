import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import IconArrowLeft from "@/assets/Icon/IconArrowLeft";
import IconBellBing from "@/assets/Icon/IconBellBing";
import IconChatNotification from "@/assets/Icon/IconChatNotification";
import IconInfoCircle from "@/assets/Icon/IconInfoCircle";
import IconLaptop from "@/assets/Icon/IconLaptop";
import IconLockDots from "@/assets/Icon/IconLockDots";
import IconLogout from "@/assets/Icon/IconLogout";
import IconMailDot from "@/assets/Icon/IconMailDot";
import IconMenu from "@/assets/Icon/IconMenu";
import IconMoon from "@/assets/Icon/IconMoon";
import IconSearch from "@/assets/Icon/IconSearch";
import IconSun from "@/assets/Icon/IconSun";
import IconUser from "@/assets/Icon/IconUser";
import IconXCircle from "@/assets/Icon/IconXCircle";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

import menuHeader from "@/assets/Images/banner.png";
import profile7 from "@/assets/Images/profile-7.jpeg";
import profile8 from "@/assets/Images/profile-8.jpeg";
import profile9 from "@/assets/Images/profile-9.jpeg";
import logo from "@/assets/logo/logo.png";

import { RootState } from "@/app/store";
import {
  toggleRTL,
  toggleSidebar,
  toggleTheme,
} from "@/features/Layout/themeConfigSlice";
import Dropdown from "../ui/dropdown";
import SearchBar from "../ui/SearchBar";

const AdminHeader = () => {
  const location = useLocation();
  useEffect(() => {
    const selector = document.querySelector(
      'ul.horizontal-menu a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const all: any = document.querySelectorAll(
        "ul.horizontal-menu .nav-link.active"
      );
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove("active");
      }
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any = ul.closest("li.menu").querySelectorAll(".nav-link");
        if (ele) {
          ele = ele[0];
          setTimeout(() => {
            ele?.classList.add("active");
          });
        }
      }
    }
  }, [location]);

  const isRtl =
    useSelector((state: RootState) => state.themeConfig.rtlClass) === "rtl"
      ? true
      : false;

  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const dispatch = useDispatch();
  const getFlagUrl = (code: string) =>
    new URL(`../../assets/flags/${code.toUpperCase()}.svg`, import.meta.url)
      .href;

  function createMarkup(messages: any) {
    return { __html: messages };
  }
  const [messages, setMessages] = useState([
    {
      id: 1,
      image:
        '<span className="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
      title: "Congratulations!",
      message: "Your OS has been updated.",
      time: "1hr",
    },
    {
      id: 2,
      image:
        '<span className="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg g xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
      title: "Did you know?",
      message: "You can switch between artboards.",
      time: "2hr",
    },
    {
      id: 3,
      image:
        '<span className="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
      title: "Something went wrong!",
      message: "Send Reposrt",
      time: "2days",
    },
    {
      id: 4,
      image:
        '<span className="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
      title: "Warning",
      message: "Your password strength is low.",
      time: "5days",
    },
  ]);

  const removeMessage = (value: number) => {
    setMessages(messages.filter((user) => user.id !== value));
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      profile: profile7,
      message:
        '<strong className="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
      time: "45 min ago",
    },
    {
      id: 2,
      profile: profile8,
      message:
        '<strong className="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
      time: "9h Ago",
    },
    {
      id: 3,
      profile: profile9,
      message:
        '<strong className="text-sm mr-1">Anna Morgan</strong>Upload a file',
      time: "9h Ago",
    },
  ]);

  const removeNotification = (value: number) => {
    setNotifications(notifications.filter((user) => user.id !== value));
  };

  const [search, setSearch] = useState(false);

  const setLocale = (flag: string) => {
    setFlag(flag);
    if (flag.toLowerCase() === "ae") {
      dispatch(toggleRTL("rtl"));
    } else {
      dispatch(toggleRTL("ltr"));
    }
  };
  const [flag, setFlag] = useState(themeConfig.locale);

  const { t } = useTranslation();
  const actionBtnClass =
    "group relative grid h-10 w-10 place-content-center rounded-full border  border-gray-200/70 bg-white/80 text-gray-600  transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-gray-800 dark:bg-black/60 dark:text-gray-300 dark:hover:bg-primary/10";

  return (
    <header
      className={`z-40 ${
        themeConfig.semidark && themeConfig.menu === "horizontal" ? "dark" : ""
      }`}
    >
      <div
        className="
    relative flex items-center gap-3
    px-6 py-3 my-4
    mx-4 md:mx-6 lg:mx-3
    bg-white/90 dark:bg-black/70
    rounded-2xl
    border border-gray-200/70 dark:border-gray-800
    backdrop-blur
  "
      >
        <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
          <Link to="/" className="main-logo flex items-center shrink-0">
            <img
              className="w-8 ltr:-ml-1 rtl:-mr-1 inline"
              src={logo}
              alt="logo"
            />
            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5  font-semibold  align-middle hidden md:inline dark:text-white-light transition-all duration-300">
              VRISTO
            </span>
          </Link>
          <button
            type="button"
            className={`${actionBtnClass} flex-none lg:hidden ltr:ml-2 rtl:mr-2`}
            onClick={() => {
              dispatch(toggleSidebar());
            }}
          >
            <IconMenu className="w-5 h-5" />
          </button>
        </div>

        <div className="ltr:mr-2 rtl:ml-2 hidden sm:block">
          <ul className="flex items-center gap-2 dark:text-[#d0d2d6]">
            <li>
              <Link
                to="/apps/chat"
                className={actionBtnClass}
                title={t("Chat")}
              >
                <IconChatNotification className=""  />
              </Link>
            </li>
          </ul>
        </div>
        <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-2 lg:space-x-3 rtl:space-x-reverse dark:text-[#d0d2d6]">
          <div className="sm:ltr:mr-auto sm:rtl:ml-auto w-full max-w-[520px]">
            <SearchBar />
            <button
              type="button"
              onClick={() => setSearch(!search)}
              className={`search_btn sm:hidden ${actionBtnClass}`}
            >
              <IconSearch className="w-4.5 h-4.5 mx-auto dark:text-[#d0d2d6]" />
            </button>
          </div>
          <div>
            {themeConfig.theme === "light" ? (
              <button
                className={actionBtnClass}
                onClick={() => {
                  dispatch(toggleTheme("dark"));
                }}
                title={t("Dark")}
              >
                <IconSun />
              </button>
            ) : (
              ""
            )}
            {themeConfig.theme === "dark" && (
              <button
                className={actionBtnClass}
                onClick={() => {
                  dispatch(toggleTheme("system"));
                }}
                title={t("System")}
              >
                <IconMoon />
              </button>
            )}
            {themeConfig.theme === "system" && (
              <button
                className={actionBtnClass}
                onClick={() => {
                  dispatch(toggleTheme("light"));
                }}
                title={t("Light")}
              >
                <IconLaptop />
              </button>
            )}
          </div>
          <div className="dropdown shrink-0">
            <Dropdown
              offset={[0, 8]}
              placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
              btnClassName={actionBtnClass}
              button={
                <img
                  className="w-5 h-5 object-cover rounded-full"
                  src={getFlagUrl(flag)}
                  alt="flag"
                />
              }
            >
              <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
                {themeConfig.languageList.map((item: any) => {
                  return (
                    <li key={item.code}>
                      <button
                        type="button"
                        className={`flex w-full hover:text-primary rounded-lg ${
                          i18next.language === item.code
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          i18next.changeLanguage(item.code);
                          // setFlag(item.code);
                          setLocale(item.code);
                        }}
                      >
                        <img
                          src={getFlagUrl(item.code)}
                          alt="flag"
                          className="w-5 h-5 object-cover rounded-full"
                        />
                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Dropdown>
          </div>
          <div className="dropdown shrink-0">
            <Dropdown
              offset={[0, 8]}
              placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
              btnClassName={actionBtnClass}
              button={<IconMailDot />}
            >
              <ul className="py-0! text-dark dark:text-white-dark w-[300px] sm:w-[375px] text-xs">
                <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                  <div className="hover:!bg-transparent overflow-hidden relative rounded-t-md p-5 text-white w-full !h-[68px]">
                    <img
                      src={menuHeader}
                      alt="header message box banner image"
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover object-center brightness-75"
                    />
                    <h4 className="font-semibold relative z-10 text-lg">
                      Messages
                    </h4>
                  </div>
                </li>
                {messages.length > 0 ? (
                  <>
                    <li onClick={(e) => e.stopPropagation()}>
                      {messages.map((message) => {
                        return (
                          <div
                            key={message.id}
                            className="flex items-center py-3 px-5"
                          >
                            <div
                              dangerouslySetInnerHTML={createMarkup(
                                message.image
                              )}
                            ></div>
                            <span className="px-3 dark:text-gray-500">
                              <div className="font-semibold text-sm dark:text-white-light/90">
                                {message.title}
                              </div>
                              <div>{message.message}</div>
                            </span>
                            <span className="font-semibold bg-white-dark/20 rounded text-dark/60 px-1 ltr:ml-auto rtl:mr-auto whitespace-pre dark:text-white-dark ltr:mr-2 rtl:ml-2">
                              {message.time}
                            </span>
                            <button
                              type="button"
                              className="text-neutral-300 hover:text-danger"
                              onClick={() => removeMessage(message.id)}
                            >
                              <IconXCircle />
                            </button>
                          </div>
                        );
                      })}
                    </li>
                    <li className=" border-white-light text-center dark:border-white/10 mt-5">
                      <button
                        type="button"
                        className="text-primary font-semibold group dark:text-gray-400 justify-center !py-4 !h-[48px]"
                      >
                        <span className="group-hover:underline ltr:mr-1 rtl:ml-1">
                          VIEW ALL ACTIVITIES
                        </span>
                        <IconArrowLeft className="group-hover:translate-x-1 transition duration-300 ltr:ml-1 rtl:mr-1" />
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="!grid place-content-center hover:!bg-transparent text-lg min-h-[200px]"
                    >
                      <div className="mx-auto ring-4 ring-primary/30 rounded-full mb-4 text-primary">
                        <IconInfoCircle fill={true} className="w-10 h-10" />
                      </div>
                      No data available.
                    </button>
                  </li>
                )}
              </ul>
            </Dropdown>
          </div>
          <div className="dropdown shrink-0">
            <Dropdown
              offset={[0, 8]}
              placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
              btnClassName={`${actionBtnClass} relative`}
              button={
                <span>
                  <IconBellBing />
                  <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                    <span className="animate-ping absolute ltr:-left-[3px] rtl:-right-[3px] -top-[3px] inline-flex h-full w-full rounded-full bg-success/50 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-success"></span>
                  </span>
                </span>
              }
            >
              <ul className="!py-0 text-dark dark:text-white-dark w-[300px] sm:w-[350px] divide-y dark:divide-white/10">
                <li onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center px-4 py-2 justify-between font-semibold">
                    <h4 className="text-lg">Notification</h4>
                    {notifications.length ? (
                      <span className="badge bg-primary/80">
                        {notifications.length}New
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </li>
                {notifications.length > 0 ? (
                  <>
                    {notifications.map((notification) => {
                      return (
                        <li
                          key={notification.id}
                          className="dark:text-white-light/90"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="group flex items-center px-4 py-2">
                            <div className="grid place-content-center rounded">
                              <div className="w-12 h-12 relative">
                                <img
                                  className="w-12 h-12 rounded-full object-cover"
                                  alt="profile"
                                  src={notification.profile}
                                />
                                <span className="bg-success w-2 h-2 rounded-full block absolute right-[6px] bottom-0"></span>
                              </div>
                            </div>
                            <div className="ltr:pl-3 rtl:pr-3 flex flex-auto">
                              <div className="ltr:pr-3 rtl:pl-3">
                                <h6
                                  dangerouslySetInnerHTML={{
                                    __html: notification.message,
                                  }}
                                ></h6>
                                <span className="text-xs block font-normal dark:text-gray-500">
                                  {notification.time}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="ltr:ml-auto rtl:mr-auto text-neutral-300 hover:text-danger opacity-0 group-hover:opacity-100"
                                onClick={() =>
                                  removeNotification(notification.id)
                                }
                              >
                                <IconXCircle />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    <li>
                      <div className="p-4">
                        <button className="btn-primary block w-full  bg-amber-400 btn-small">
                          Read All Notifications
                        </button>
                      </div>
                    </li>
                  </>
                ) : (
                  <li onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="!grid place-content-center hover:!bg-transparent text-lg min-h-[200px]"
                    >
                      <div className="mx-auto ring-4 ring-primary/30 rounded-full mb-4 text-primary">
                        <IconInfoCircle fill={true} className="w-10 h-10" />
                      </div>
                      No data available.
                    </button>
                  </li>
                )}
              </ul>
            </Dropdown>
          </div>
          <div className="dropdown shrink-0 flex">
            <Dropdown
              offset={[0, 8]}
              placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
              btnClassName="relative group rounded-full p-0.5 border border-gray-200/70 bg-white/80 shadow-sm transition hover:border-primary/30 dark:border-gray-800 dark:bg-black/60"
              button={
                <img
                  className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100 transition"
                  src={profile7}
                  alt="userProfile"
                />
              }
            >
              <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                <li>
                  <div className="flex items-center px-4 py-4">
                    <img
                      className="rounded-md w-10 h-10 object-cover"
                      src={profile7}
                      alt="userProfile"
                    />
                    <div className="ltr:pl-4 rtl:pr-4 truncate">
                      <h4 className="text-base">
                        John Doe
                        <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2">
                          Pro
                        </span>
                      </h4>
                      <button
                        type="button"
                        className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
                      >
                        johndoe@gmail.com
                      </button>
                    </div>
                  </div>
                </li>
                <li>
                  <Link to="/users/profile" className="dark:hover:text-white">
                    <IconUser className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/auth/boxed-lockscreen"
                    className="dark:hover:text-white"
                  >
                    <IconLockDots className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                    Lock Screen
                  </Link>
                </li>
                <li className="border-t border-white-light dark:border-white-light/10">
                  <Link to="/auth/boxed-signin" className="text-danger !py-3">
                    <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                    Sign Out
                  </Link>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
