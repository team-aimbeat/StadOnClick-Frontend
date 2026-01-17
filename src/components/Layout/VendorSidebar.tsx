import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { HiChevronDown } from "react-icons/hi2";
import PerfectScrollbar from "react-perfect-scrollbar";

import { RootState } from "@/app/store";
import { toggleSidebar } from "@/features/Layout/themeConfigSlice";
import {
  VendorNavGroup,
  getVendorNavGroups,
} from "@/routes/vendorNavItems";
import { cn } from "@/lib/utils";

type OpenMap = Record<string, boolean>;

export default function VendorSidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isCollapsed = !themeConfig.sidebar;

  const navGroups: VendorNavGroup[] = useMemo(
    () =>
      getVendorNavGroups({
        newLeads: 4,
        pendingBookings: 2,
        kycStatus: "NOT_SUBMITTED",
        subscriptionExpired: true,
      }),
    []
  );

  const [openItems, setOpenItems] = useState<OpenMap>({});

  useEffect(() => {
    const nextOpen: OpenMap = {};
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (!item.children) return;
        const childActive = item.children.some((child) => {
          const childPath = child.to.split("?")[0];
          return location.pathname.startsWith(childPath);
        });
        if (childActive) {
          nextOpen[item.label] = true;
        }
      });
    });
    setOpenItems((prev) => ({ ...prev, ...nextOpen }));
  }, [location.pathname, navGroups]);

  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 z-40 bg-white shadow-sm transition-[width] duration-300 ease-out",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
      data-collapsed={isCollapsed}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center font-bold">
            S
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-900">
                StadonClick Vendor
              </p>
              <p className="text-[11px] text-slate-500">
                Growth workspace
              </p>
            </div>
          )}
        </div>
      </div>
      <PerfectScrollbar className="h-[calc(100vh-76px)]">
        <div className="space-y-6 px-3 mt-4 pb-6">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-semibold tracking-[0.15em] text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const hasChildren = !!item.children?.length;
                  const isOpen = openItems[item.label];
                  return (
                    <div key={item.label}>
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            className={cn(
                              "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50",
                              isOpen && "bg-blue-50 text-blue-700"
                            )}
                            onClick={() => toggleItem(item.label)}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-3",
                                isCollapsed && "justify-center"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-md border border-slate-200",
                                  isOpen && "border-blue-200 bg-white text-blue-700"
                                )}
                              >
                                <ItemIcon className="h-5 w-5" />
                              </span>
                              {!isCollapsed && <span>{item.label}</span>}
                            </div>
                            {!isCollapsed && (
                              <div className="ml-auto flex items-center gap-2">
                                {item.badge ? (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                    {item.badge}
                                  </span>
                                ) : null}
                                <HiChevronDown
                                  className={cn(
                                    "h-4 w-4 text-slate-500 transition-transform",
                                    isOpen && "rotate-180"
                                  )}
                                />
                              </div>
                            )}
                          </button>
                          {!isCollapsed && (
                            <div
                              className={cn(
                                "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-in-out",
                                isOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              )}
                            >
                              <div className="min-h-0 space-y-1 rounded-md bg-white px-3 py-2">
                                {item.children?.map((child) => (
                                  <NavLink
                                    key={child.label}
                                    to={child.to}
                                    onClick={() => {
                                      if (window.innerWidth < 1024) {
                                        dispatch(toggleSidebar());
                                      }
                                    }}
                                    className={({ isActive }) => {
                                      const target = new URL(child.to, window.location.origin);
                                      const hasSearch = !!target.search;
                                      const matchesSearch =
                                        location.pathname === target.pathname &&
                                        location.search === target.search;
                                      const matchesNoSearch =
                                        !hasSearch &&
                                        location.pathname === target.pathname &&
                                        location.search === "";
                                      const displayActive = hasSearch
                                        ? matchesSearch
                                        : matchesNoSearch && isActive;
                                      return cn(
                                        "flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50",
                                        displayActive &&
                                          "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                                      );
                                    }}
                                  >
                                    {({ isActive }) => {
                                      const target = new URL(child.to, window.location.origin);
                                      const hasSearch = !!target.search;
                                      const matchesSearch =
                                        location.pathname === target.pathname &&
                                        location.search === target.search;
                                      const matchesNoSearch =
                                        !hasSearch &&
                                        location.pathname === target.pathname &&
                                        location.search === "";
                                      const displayActive = hasSearch
                                        ? matchesSearch
                                        : matchesNoSearch && isActive;
                                      return (
                                        <>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                displayActive ? "bg-blue-600" : "bg-slate-300"
                                              )}
                                            />
                                            <span>{child.label}</span>
                                          </div>
                                          {child.badge ? (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                              {child.badge}
                                            </span>
                                          ) : null}
                                        </>
                                      );
                                    }}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <NavLink
                          to={item.to ?? "/"}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              dispatch(toggleSidebar());
                            }
                          }}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50",
                              isActive && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-md border border-slate-200",
                                  isActive && "border-blue-200 bg-white text-blue-700"
                                )}
                              >
                                <ItemIcon className="h-5 w-5" />
                              </span>
                              {!isCollapsed && <span>{item.label}</span>}
                              {!isCollapsed && item.badge ? (
                                <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                  {item.badge}
                                </span>
                              ) : null}
                            </>
                          )}
                        </NavLink>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PerfectScrollbar>
    </aside>
  );
}
