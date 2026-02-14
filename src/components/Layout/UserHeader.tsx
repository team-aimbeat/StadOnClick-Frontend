import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Bookmark, BriefcaseBusiness, ChevronLeft, ChevronRight, Heart, Megaphone, Search, ShoppingBag, ShoppingCartIcon, Sparkles, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/api/authApi";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
  type UserNotificationItem,
} from "@/features/notifications/api/userNotificationsApi";
import {
  useGetMasterCategoriesQuery,
  useLazyGetServiceCategoriesByMasterQuery,
  type ServiceCategory,
} from "@/services/serviceCategoriesApi";
import { plannedCategories } from "@/data/vendorServiceCategories";
import {
  CART_UPDATED_EVENT,
  getCartItemCount,
  getCartSubtotal,
  getStoredCart,
  type StoredCart,
} from "@/utils/cartStorage";

const searchCategories = [
  { label: "Beauty", slug: "salon-deals" },
  { label: "Sports", slug: "games-outings" },
  { label: "Events", slug: "new-deals" },
  { label: "Hotels", slug: "restaurant-deals" },
  { label: "Vacation", slug: "gift-cards" },
  { label: "Dining", slug: "buffet-deals" },
];

const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad"];

const cartPreviewItems: CartPreviewItem[] = [
  {
    title: "Nordic Spa Evening",
    detail: "2 guests - Feb 12",
    price: "$145",
  },
  {
    title: "Stockholm Street Food Tour",
    detail: "1 guest - Feb 14",
    price: "$95",
  },
  {
    title: "Archipelago Kayak Adventure",
    detail: "1 guest - Feb 18",
    price: "$110",
  },
];

const cartPreviewSubtotal = cartPreviewItems.reduce(
  (total, item) =>
    total + Number(item.price.replace(/[^0-9.]/g, "")),
  0
);

const navLinkBase =
  "group flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30";


const categoryAccentClasses = [
  "bg-rose-50 text-rose-600",
  "bg-amber-50 text-amber-600",
  "bg-lime-50 text-lime-600",
  "bg-emerald-50 text-emerald-600",
  "bg-sky-50 text-sky-600",
  "bg-indigo-50 text-indigo-600",
  "bg-purple-50 text-purple-600",
  "bg-fuchsia-50 text-fuchsia-600",
];

const resolveUserAvatarUrl = (user: unknown) => {
  if (!user || typeof user !== "object") return "";
  const candidate = user as Record<string, unknown>;
  const raw =
    candidate.profileImageUrl ??
    candidate.avatar ??
    candidate.profileImage ??
    null;
  return typeof raw === "string" ? raw.trim() : "";
};

export default function UserHeader() {
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [cartMenuOpen, setCartMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isProfileImageBroken, setIsProfileImageBroken] = useState(false);
  const [cartSnapshot, setCartSnapshot] = useState<StoredCart>(() => getStoredCart());
  const anyMenuOpen = profileMenuOpen || cartMenuOpen || notificationsMenuOpen;

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

  const {
    data: notificationsResponse,
    isFetching: isNotificationsFetching,
    error: notificationsError,
  } = useGetNotificationsQuery({ page: 1, limit: 5 }, { skip: !user });
  const { data: unreadResponse } = useGetUnreadCountQuery(undefined, { skip: !user });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkAllReadLoading }] = useMarkAllReadMutation();
  const notificationsList = (notificationsResponse?.data ?? []) as UserNotificationItem[];
  const fallbackUnreadCount = notificationsList.filter((notification) => !notification.readAt).length;
  const unreadCount = unreadResponse?.count ?? fallbackUnreadCount;
  const isEmptyNotifications = !notificationsList.length && !isNotificationsFetching;
  const isNotificationsLoading = isNotificationsFetching && !notificationsList.length;
  const notificationsBadge = unreadCount > 0 ? String(unreadCount) : undefined;
  const cartItemCount = getCartItemCount(cartSnapshot);
  const cartPreviewSubtotal = getCartSubtotal(cartSnapshot);
  const cartBadge = cartItemCount > 0 ? String(cartItemCount) : undefined;
  const cartPreviewItems = cartSnapshot.items.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    quantityLabel: `Qty ${item.quantity}`,
    description: item.description ?? "",
    price: `SEK ${item.totalPrice.toFixed(0)}`,
  }));
  const hasCartItems = cartSnapshot.items.length > 0;

  useEffect(() => {
    const syncCart = () => setCartSnapshot(getStoredCart());

    syncCart();
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    if (!anyMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        cartRef.current &&
        !cartRef.current.contains(target)
      ) {
        setCartMenuOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anyMenuOpen]);

  const categoryLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    searchCategories.forEach((c) => lookup.set(c.label.toLowerCase(), c.slug));
    return lookup;
  }, []);

  const handleSearch = () => {
    const normalized = query.trim().toLowerCase();
    const directMatch = categoryLookup.get(normalized);
    const partialMatch = searchCategories.find((c) =>
      c.label.toLowerCase().includes(normalized)
    );
    const target = directMatch ?? partialMatch?.slug ?? "new-deals";
    navigate(`/services/${target}`, {
      state: { location: locations[0], query },
    });
  };

  const [hoveredMasterSlug, setHoveredMasterSlug] = useState<string | null>(null);
  const [subCategoryCache, setSubCategoryCache] = useState<Record<string, ServiceCategory[]>>({});
  const [isSubCategoriesLoading, setIsSubCategoriesLoading] = useState(false);
  const [popoverTop, setPopoverTop] = useState(0);
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const navListRef = useRef<HTMLDivElement | null>(null);

  const { data: masterCategories = [] } = useGetMasterCategoriesQuery();
  const [fetchCategoriesForMaster] = useLazyGetServiceCategoriesByMasterQuery();

  const plannedCategoryMap = useMemo(
    () => new Map(plannedCategories.map((category) => [category.slug, category])),
    []
  );

  const hoveredMaster = hoveredMasterSlug
    ? masterCategories.find((master) => master.slug === hoveredMasterSlug)
    : undefined;
  const hoveredMasterId = hoveredMaster?.id ?? null;

  useEffect(() => {
    if (!hoveredMasterId || subCategoryCache[hoveredMasterId]) {
      return;
    }

    let cancelled = false;
    setIsSubCategoriesLoading(true);

    fetchCategoriesForMaster(hoveredMasterId)
      .unwrap()
      .then((result: any) => {
        if (!cancelled) {
          setSubCategoryCache((prev) => ({
            ...prev,
            [hoveredMasterId]: result,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubCategoryCache((prev) => ({ ...prev, [hoveredMasterId]: [] }));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSubCategoriesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hoveredMasterId, fetchCategoriesForMaster, subCategoryCache]);

  const hoveredPlannedCategory = hoveredMasterSlug
    ? plannedCategoryMap.get(hoveredMasterSlug)
    : undefined;
  const hoveredSubCategories = hoveredMasterId
    ? subCategoryCache[hoveredMasterId] ?? []
    : [];
  const HoveredIcon = hoveredPlannedCategory?.icon;
  const megaMenuImageSrc =
    hoveredPlannedCategory?.imageOptimized ?? hoveredPlannedCategory?.image;
  const megaMenuImageSrcSet =
    hoveredPlannedCategory?.imageOptimized && hoveredPlannedCategory?.image
      ? `${hoveredPlannedCategory.imageOptimized} 640w, ${hoveredPlannedCategory.image} 1280w`
      : undefined;
  const subcategoryColumns = useMemo(() => {
    // Only split when we have enough items to justify 2 columns; otherwise it
    // creates a lot of dead space in the left panel.
    const useTwoColumns = hoveredSubCategories.length > 10;
    if (!useTwoColumns) {
      return [hoveredSubCategories, []] as const;
    }

    const midpoint = Math.ceil(hoveredSubCategories.length / 2);
    return [
      hoveredSubCategories.slice(0, midpoint),
      hoveredSubCategories.slice(midpoint),
    ] as const;
  }, [hoveredSubCategories]);
  const [firstColumn, secondColumn] = subcategoryColumns;
  const hasSecondSubcategoryColumn = secondColumn.length > 0;
  const handleHover = (
    _event: ReactMouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    const containerRect = navContainerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopoverTop(containerRect.height);
    }

    setHoveredMasterSlug(slug);
  };

  useEffect(() => {
    if (!hoveredMasterSlug) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (navContainerRef.current && navContainerRef.current.contains(target)) ||
        (megaMenuRef.current && megaMenuRef.current.contains(target))
      ) {
        return;
      }
      setHoveredMasterSlug(null);
    };

    const handleDocumentPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        (navContainerRef.current && navContainerRef.current.contains(target)) ||
        (megaMenuRef.current && megaMenuRef.current.contains(target))
      ) {
        return;
      }
      setHoveredMasterSlug(null);
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("pointermove", handleDocumentPointer);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("pointermove", handleDocumentPointer);
    };
  }, [hoveredMasterSlug]);

  const scrollNavigation = (direction: "left" | "right") => {
    if (!navListRef.current) return;
    const offset = direction === "right" ? 320 : -320;
    navListRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const accountName = useMemo(() => {
    if (!user) {
      return "StadOnClick member";
    }

    if (user.displayName?.trim()) {
      return user.displayName.trim();
    }

    const first = user.firstName?.trim() ?? "";
    const last = user.lastName?.trim() ?? "";
    const joined = `${first} ${last}`.trim();

    if (joined) {
      return joined;
    }

    return user.email;
  }, [user]);

  const userInitial = useMemo(() => {
    if (!user) {
      return "S";
    }

    const firstLetter =
      user.firstName?.trim()[0] ??
      user.displayName?.trim()[0] ??
      user.email?.trim()[0];

    return firstLetter ? firstLetter.toUpperCase() : "S";
  }, [user]);

  const greetingName = useMemo(() => {
    if (user?.firstName?.trim()) {
      return user.firstName.trim();
    }

    return accountName;
  }, [accountName, user]);

  const profileImageUrl = resolveUserAvatarUrl(user);
  const canShowProfileImage = Boolean(profileImageUrl) && !isProfileImageBroken;

  useEffect(() => {
    setIsProfileImageBroken(false);
  }, [profileImageUrl]);

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      dispatch(clearAuth());
      setProfileMenuOpen(false);
      return;
    }

    dispatch(clearAuth());
    setProfileMenuOpen(false);
  };

  const menuItems = useMemo(
    () => [
      {
        label: "My Orders",
        icon: <ShoppingBag className="h-4 w-4" />,
        onClick: () => navigate("/orders"),
      },
      {
        label: "My Wishlist",
        icon: <Heart className="h-4 w-4" />,
        onClick: () => navigate("/wishlist"),
      },
      {
        label: "Notifications",
        icon: <Bell className="h-4 w-4" />,
        meta: notificationsBadge,
        onClick: () => setNotificationsMenuOpen(true),
      },
    ],
    [navigate, notificationsBadge],
  );

  const handleNotificationSelect = async (notification: UserNotificationItem) => {
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id).unwrap();
      } catch {
        /* ignore */
      }
    }

    setNotificationsMenuOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    try {
      await markAllRead().unwrap();
    } catch {
      /* ignore */
    }
  };

  const utilityLinks = [
    "Curated local moments",
    "Download the companion app",
    "24/7 help on live chat",
  ];

  const dropdownMotion = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      };
    }

    return {
      initial: { opacity: 0, y: 10, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 10, scale: 0.98 },
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
    };
  }, [reduceMotion]);

  const megaMenuMotion = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      };
    }

    return {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
    };
  }, [reduceMotion]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-3 px-3 py-1 sm:px-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900"
          >
<div className="h-8 w-8 rounded-full bg-blue-700">
              <span className="sr-only">StadOnClick logo</span>
            </div>
            <div className="leading-tight">
              
              <p className="text-sm font-semibold tracking-tight text-slate-500">
                StadOnClick
              </p>
              <p className="text-base font-semibold tracking-tight text-slate-900">
                Discover Sweden
              </p>
            </div>
          </Link>

          <div className="flex flex-1 min-w-[260px] justify-center">
            <div className="w-full max-w-3xl">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                <input
                  type="search"
                  placeholder="Search salons, gyms, restaurants, experiences..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" && handleSearch()
                  }
                  className="flex-1 bg-transparent px-2 py-2 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white  hover:bg-emerald-700"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 text-xs font-semibold sm:flex">
           
            <button
              type="button"
              onClick={() => {
                setCartMenuOpen(false);
                setNotificationsMenuOpen(false);
                setProfileMenuOpen(false);
                if (!user) {
                  navigate("/sign-in");
                  return;
                }

                const isVendor = (user.roles ?? []).includes("VENDOR");
                if (isVendor) {
                  navigate(user.nextAction || "/vendor/dashboard");
                  return;
                }

                navigate("/business/onboarding");
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[14px] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Business with StadOnClick"
            >
              <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
              Business on StadOnClick
            </button>
                     
            <button
              type="button"
              onClick={() => {
                setCartMenuOpen(false);
                setNotificationsMenuOpen(false);
                setProfileMenuOpen(false);
                if (!user) {
                  navigate("/sign-in");
                  return;
                }
                const isAffiliate = (user.roles ?? []).includes("AFFILIATE");
                navigate(isAffiliate ? "/affiliate/dashboard" : "/affiliate-marketing");
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[14px] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Affiliate Program"
            >
              <Megaphone className="h-4 w-4 text-indigo-500" />
              Affiliate Program
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              label="Wishlist"
              onClick={() => {
                setCartMenuOpen(false);
                setNotificationsMenuOpen(false);
                setProfileMenuOpen(false);
                navigate("/wishlist");
              }}
            />
            <IconButton
              icon={<ShoppingBag className="h-5 w-5 text-amber-600" />}
              label="My orders"
              onClick={() => {
                setCartMenuOpen(false);
                setNotificationsMenuOpen(false);
                setProfileMenuOpen(false);
                navigate("/orders");
              }}
              className="border-amber-200 bg-amber-50 text-amber-600"
            />
            <div ref={cartRef} className="relative">
              <IconButton
                icon={<ShoppingCartIcon className="h-5 w-5 text-indigo-600" />}
                label="Cart"
                badge={cartBadge}
                onClick={() => {
                  setCartMenuOpen((prev) => !prev);
                  setNotificationsMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
                className="bg-slate-50"
              />

              <AnimatePresence>
                {cartMenuOpen ? (
                  <motion.div
                    {...dropdownMotion}
                    className="absolute right-0 top-full z-40 mt-2 w-[360px] origin-top-right rounded-3xl border border-slate-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.18)] will-change-transform"
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Shopping cart
                          </p>
                          <p className="text-xs text-slate-500">
                            Ready when you are
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-sky-500">
                          {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {hasCartItems ? (
                          cartPreviewItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="block max-w-full truncate text-sm font-semibold text-slate-900">
                                  {item.title}
                                </span>
                                <span className="mt-0.5 block text-xs font-medium text-slate-600">
                                  {item.quantityLabel}
                                </span>
                                {item.description ? (
                                  <span className="mt-0.5 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">
                                    {item.description}
                                  </span>
                                ) : null}
                              </div>
                              <span className="shrink-0 text-sm font-semibold text-slate-900">
                                {item.price}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-5 text-center text-sm text-slate-500">
                            Your cart is empty.
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <Link
                          to="/orders"
                          className="font-medium text-sky-600 transition hover:text-sky-900"
                        >
                          View orders
                        </Link>
                        <span className="text-xs font-semibold text-slate-600">
                          Subtotal SEK {cartPreviewSubtotal.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div ref={notificationsRef} className="relative">
              <IconButton
                icon={<Bell className="h-5 w-5 text-emerald-600" />}
                label="Alerts"
                badge={notificationsBadge}
                onClick={() => {
                  setNotificationsMenuOpen((prev) => !prev);
                  setCartMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
                className="border-emerald-200 bg-emerald-50 text-emerald-600"
              />

              <AnimatePresence>
                {notificationsMenuOpen ? (
                  <motion.div
                    {...dropdownMotion}
                    className="absolute right-0 top-full z-40 mt-2 w-[320px] origin-top-right rounded-3xl border border-slate-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.18)] will-change-transform"
                  >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Notifications
                        </p>
                        <p className="text-xs text-slate-500">
                          Live updates from StadOnClick
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 disabled:text-slate-300"
                        disabled={!unreadCount || isMarkAllReadLoading}
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 bg-white">
                    {notificationsError ? (
                      <div className="flex items-center justify-center px-4 py-10 text-sm text-slate-500">
                        Unable to load notifications
                      </div>
                    ) : isNotificationsLoading ? (
                      <div className="flex items-center justify-center px-4 py-10 text-sm text-slate-500">
                        Loading notifications...
                      </div>
                    ) : notificationsList.length ? (
                      <ul className="max-h-90 space-y-2 overflow-auto px-2 py-2">
                        {notificationsList.map((notification) => {
                          const isUnread = !notification.readAt;
                          return (
                            <li key={notification.id}>
                              <button
                                type="button"
                                onClick={() => handleNotificationSelect(notification)}
                                className={cn(
                                  "flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left transition",
                                  isUnread
                                    ? "bg-slate-50 hover:bg-slate-100"
                                    : "bg-white hover:bg-slate-50",
                                )}
                              >
                                <div className="flex flex-1 flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {notification.title}
                                    </p>
                                    {isUnread ? (
                                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                    ) : null}
                                  </div>
                                  {notification.body ? (
                                    <p className="text-xs text-slate-500">
                                      {notification.body}
                                    </p>
                                  ) : null}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center text-xs text-slate-500">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Bell className="h-6 w-6" strokeWidth={1.8} />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          You're all caught up
                        </p>
                        <p className="text-xs text-slate-500">
                          We will keep you posted.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {utilityLinks.map((link) => (
                        <button
                          key={link}
                          type="button"
                          className="rounded-xl border border-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          {link}
                        </button>
                      ))}
                    </div>
                  </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full  bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  {canShowProfileImage ? (
                    <img
                      src={profileImageUrl}
                      alt={accountName}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                      onError={() => setIsProfileImageBroken(true)}
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-blue-700">
                      {userInitial}
                    </span>
                  )}
                  <span className="sr-only">{accountName}</span>
                </button>

                <AnimatePresence>
                  {profileMenuOpen ? (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute z-50 -right-[190%] mt-2 w-75 origin-top-right rounded-3xl border bg-white shadow-[0_45px_90px_rgba(15,23,42,0.18)] will-change-transform"
                    >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-sky-100">
                      <p className="text-sm font-semibold text-slate-900">
                        Hi, {greetingName}!
                      </p>
                      <button
                        type="button"
                        className="rounded-full p-1 text-sky-500 transition hover:bg-slate-100 hover:text-sky-700"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close menu</span>
                      </button>
                    </div>

                    <a href="/account">
                      <div className="flex items-center hover:bg-gray-200 transition-colors duration-100 cursor-pointer gap-3 px-5 py-4 border-b border-sky-100">
                        {canShowProfileImage ? (
                          <img
                            src={profileImageUrl}
                            alt={accountName}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                            onError={() => setIsProfileImageBroken(true)}
                          />
                        ) : (
                          <div className="flex h-15 w-15 items-center justify-center rounded-full bg-sky-50 text-lg font-semibold text-blue-700">
                            {userInitial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {accountName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </div>
                    </a>
                    <div className="space-y-1 px-4 py-3">
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-sky-50"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            item.onClick();
                          }}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-blue-700">
                            {item.icon}
                          </span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.meta && (
                            <span className="text-xs font-semibold text-sky-500">
                              {item.meta}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-sky-100 hover:bg-gray-200 transition-colors duration-100 cursor-pointer  rounded-b-2xl px-5 py-3">
                      <button
                        type="button"
                        className="w-full text-left text-sm font-semibold cursor-pointer  text-blue-700 transition hover:text-blue-900 disabled:cursor-wait disabled:text-slate-400"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        Sign Out
                      </button>
                    </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <a
                href="/sign-in"
                className="flex items-center gap-2 rounded-full  bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              >
                <UserRound className="h-5 w-5 text-slate-500" />
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="relative" onMouseLeave={() => setHoveredMasterSlug(null)}>
          <div
            ref={navContainerRef}
            className="relative mx-auto flex w-full max-w-screen-2xl items-center gap-2 overflow-hidden px-3 py-0.5"
          >
            <button
              type="button"
              onClick={() => scrollNavigation("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow shadow-slate-200/60 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div className="flex-1 overflow-hidden">
              <div
                ref={navListRef}
                className="flex w-full gap-3 overflow-x-auto px-1 py-1 scrollbar-hidden"
              >
                {masterCategories.map((master, index) => {
                  const planned = plannedCategoryMap.get(master.slug);
                  const IconComponent = planned?.icon;
                  const isHovered = hoveredMasterSlug === master.slug;
                  const accentClass =
                    categoryAccentClasses[index % categoryAccentClasses.length];

                  return (
                    <NavLink
                      key={master.slug}
                      to={`/services/${master.slug}`}
                      onMouseEnter={(event) => handleHover(event, master.slug)}
                      className={({ isActive }) =>
                        cn(
                          navLinkBase,
                          (isActive || isHovered) && "border-slate-200 text-slate-900",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base font-semibold shadow-sm transition duration-150",
                              accentClass,
                              (isActive || isHovered) && "ring-2 ring-emerald-500/60",
                            )}
                          >
                            {IconComponent ? (
                              <IconComponent className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </span>
                          <span className="flex-1 text-sm font-semibold text-slate-900 whitespace-nowrap tracking-wide drop-shadow-[0_2px_4px_rgba(15,23,42,0.25)] ml-1">
                            {master.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => scrollNavigation("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow shadow-slate-200/60 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <AnimatePresence>
            {hoveredMaster ? (
        <motion.div
          key={hoveredMaster.slug}
          {...megaMenuMotion}
          className="absolute left-0 right-0 z-40 will-change-transform"
          style={{ top: popoverTop }}
          ref={megaMenuRef}
        >
              <div className="mx-auto w-full max-w-7xl overflow-hidden border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                <div
                  className={cn(
                    "grid grid-cols-1",
                    hasSecondSubcategoryColumn
                      ? "md:grid-cols-[420px_1fr]"
                      : "md:grid-cols-[340px_1fr]",
                  )}
                >
                  <div className="px-8 py-8">
                    <p className="text-xs font-semibold text-slate-500">
                      Subcategories
                    </p>

                    {isSubCategoriesLoading && !hoveredSubCategories.length ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Loading...
                      </p>
                    ) : hoveredSubCategories.length ? (
                      <div
                        className={cn(
                          "mt-5 grid gap-x-8",
                          hasSecondSubcategoryColumn ? "grid-cols-2" : "grid-cols-1",
                        )}
                      >
                        <div className="space-y-3">
                          {firstColumn.map((category) => (
                            <Link
                              key={category.id}
                              to={`/services/${category.slug}`}
                              className={cn(
                                "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-900 transition-all duration-200",
                                "before:absolute before:left-3 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-slate-200 before:content-['']",
                                "pl-7 hover:-translate-y-px hover:bg-slate-50 hover:text-blue-700 hover:shadow-sm",
                                "hover:before:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2",
                              )}
                            >
                              <span className="truncate">{category.name}</span>
                              <ChevronRight className="h-3 w-3 flex-none text-slate-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                        {hasSecondSubcategoryColumn ? (
                          <div className="space-y-3">
                            {secondColumn.map((category) => (
                              <Link
                                key={category.id}
                                to={`/services/${category.slug}`}
                                className={cn(
                                  "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-900 transition-all duration-200",
                                  "before:absolute before:left-3 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-slate-200 before:content-['']",
                                  "pl-7 hover:-translate-y-px hover:bg-slate-50 hover:text-blue-700 hover:shadow-sm",
                                  "hover:before:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2",
                                )}
                              >
                                <span className="truncate">{category.name}</span>
                                <ChevronRight className="h-3 w-3 flex-none text-slate-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100" />
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        No subcategories available.
                      </p>
                    )}
                  </div>

                  <div className="relative min-h-105 bg-slate-100">
                    {megaMenuImageSrc ? (
                      <img
                        src={megaMenuImageSrc}
                        srcSet={megaMenuImageSrcSet}
                        sizes="(min-width: 768px) 60vw, 100vw"
                        alt={`${hoveredMaster.name} cover`}
                        className="absolute inset-0 h-full w-full object-cover"
                        decoding="async"
                        loading="eager"
                      />
                    ) : null}

                    <div className="absolute inset-0 bg-linear-to-t
                     from-black/45 via-black/0 to-black/0" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900">
                        {HoveredIcon ? (
                          <HoveredIcon className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-base font-semibold text-white drop-shadow">
                        {hoveredMaster.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

type IconButtonProps = {
  icon: ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
};

function IconButton({ icon, label, badge, onClick, className }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-blue-700 transition-all duration-200 hover:-translate-y-[1px] hover:border-yellow-400 hover:shadow-sm active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2",
        className,
      )}
    >
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 45) return "Just now";
  if (diffSeconds < 3600) return `${Math.max(1, Math.floor(diffSeconds / 60))}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  if (diffSeconds < 172800) return "Yesterday";

  return date.toLocaleDateString();
}


