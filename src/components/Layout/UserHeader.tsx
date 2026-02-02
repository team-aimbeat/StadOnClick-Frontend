import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Box,
  ChevronRight,
  Coffee,
  Gift,
  Heart,
  Home,
  Leaf,
  MapPin,
  Plane,
  ShoppingCart,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/api/authApi";

type Category = {
  label: string;
  to: string;
  icon: ReactNode;
  subTitle?: string;
  subItems?: string[][];
};

type CartPreviewItem = {
  title: string;
  detail: string;
  price: string;
};

type NotificationItem = {
  title: string;
  time: string;
};

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

const notificationItems: NotificationItem[] = [
  {
    title: "Curated local moments just dropped",
    time: "2h ago",
  },
  {
    title: "Download the companion app for offline use",
    time: "Yesterday",
  },
  {
    title: "Live chat is now available 24/7",
    time: "Just now",
  },
];

const cartPreviewSubtotal = cartPreviewItems.reduce(
  (total, item) =>
    total + Number(item.price.replace(/[^0-9.]/g, "")),
  0
);

const navLinkBase =
  "relative flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap font-semibold text-slate-700 transition-colors duration-200";

export default function UserHeader() {
  const [hovered, setHovered] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const [cartMenuOpen, setCartMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [query, setQuery] = useState("");

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeaderSearch(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const categories = useMemo<Category[]>(
    () => [
      {
        label: "New Year Sale",
        to: "/marketplace?tag=new-year",
        icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
      },
      {
        label: "Beauty & Spas",
        to: "/marketplace/beauty",
        icon: <Leaf className="h-4 w-4 text-pink-500" />,
        subTitle: "Beauty & Spas",
        subItems: [
          [
            "Massage",
            "Hair Removal",
            "Face & Skin Care",
            "Cosmetic Procedures",
          ],
          ["Spas", "Hair & Styling", "Health & Fitness", "Weight Loss"],
          ["Nail Salons", "Dental", "Brows & Lashes", "Tanning"],
        ],
      },
      {
        label: "Things To Do",
        to: "/marketplace/things-to-do",
        icon: <Activity className="h-4 w-4 text-purple-500" />,
      },
      {
        label: "Auto & Home",
        to: "/marketplace/auto-home",
        icon: <Home className="h-4 w-4 text-amber-500" />,
      },
      {
        label: "Food & Drink",
        to: "/marketplace/food",
        icon: <Coffee className="h-4 w-4 text-orange-500" />,
      },
      {
        label: "Gifts",
        to: "/marketplace/gifts",
        icon: <Gift className="h-4 w-4 text-rose-500" />,
      },
      {
        label: "Local",
        to: "/marketplace/local",
        icon: <MapPin className="h-4 w-4 text-sky-500" />,
      },
      {
        label: "Travel",
        to: "/marketplace/travel",
        icon: <Plane className="h-4 w-4 text-indigo-500" />,
      },
      {
        label: "Goods",
        to: "/marketplace/goods",
        icon: <Box className="h-4 w-4 text-yellow-500" />,
      },
      {
        label: "Coupons",
        to: "/marketplace/coupons",
        icon: <Ticket className="h-4 w-4 text-violet-500" />,
      },
    ],
    []
  );

  const beautyCategory = categories.find((c) => c.label === "Beauty & Spas");

  const handleHover = (
    _event: ReactMouseEvent<HTMLAnchorElement>,
    label: string
  ) => {
    setHovered(label);
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

  const menuItems = [
    { label: "My Wishlist", icon: <Heart className="h-4 w-4" /> },

    {
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      meta: "1",
    },
  ];

  const utilityLinks = [
    "Curated local moments",
    "Download the companion app",
    "24/7 help on live chat",
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900"
          >
            <div className="h-10 w-10 rounded-full bg-blue-700">
              <span className="sr-only">StadOnClick logo</span>
            </div>
            <div className="leading-tight">
              
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                StadOnClick
              </p>
              <p className="text-base font-semibold tracking-[0.1em] text-slate-900">
                Discover Sweden
              </p>
            </div>
          </Link>

          <div className="flex-1">
    
              <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                <input
                  type="search"
                  placeholder="Search salons, gyms, restaurants, events..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" && handleSearch()
                  }
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-full bg-blue-500 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Heart className="h-5 w-5 text-slate-500" />}
              label="Wishlist"
              onClick={() => {
                setCartMenuOpen(false);
                setNotificationsMenuOpen(false);
                setProfileMenuOpen(false);
                navigate("/wishlist");
              }}
            />
            <div ref={cartRef} className="relative">
              <IconButton
                icon={<ShoppingCart className="h-5 w-5 text-slate-500" />}
                label="Cart"
                badge="3"
                onClick={() => {
                  setCartMenuOpen((prev) => !prev);
                  setNotificationsMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
              />

              {cartMenuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-[320px] rounded-3xl border border-slate-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.18)]">
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
                        {cartPreviewItems.length} items
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {cartPreviewItems.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.detail}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <Link
                        to="/cart"
                        className="text-sky-600 transition hover:text-sky-900"
                      >
                        View cart
                      </Link>
                      <span className="text-xs font-semibold text-slate-500">
                        Subtotal ${cartPreviewSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={notificationsRef} className="relative">
              <IconButton
                icon={<Bell className="h-5 w-5 text-slate-500" />}
                label="Alerts"
                badge="9"
                onClick={() => {
                  setNotificationsMenuOpen((prev) => !prev);
                  setCartMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
              />

              {notificationsMenuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-[320px] rounded-3xl border border-slate-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.18)]">
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
                        className="text-xs font-semibold text-slate-400 transition hover:text-slate-700"
                      >
                        Mark read
                      </button>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                      {notificationItems.map((item) => (
                        <li key={item.title} className="flex gap-3">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500">{item.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
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
                </div>
              )}
            </div>
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-yellow-400"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-blue-700">
                    {userInitial}
                  </span>
                  <span className="sr-only">{accountName}</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute z-50 -right-[190%] mt-2 w-75 rounded-3xl border  bg-white shadow-[0_45px_90px_rgba(15,23,42,0.18)]">
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-lg font-semibold text-blue-700">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {accountName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </a>
                    <div className="space-y-1 px-4 py-3">
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-sky-50"
                          onClick={() => setProfileMenuOpen(false)}
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
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/sign-in"
                className="flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-sky-900 transition hover:border-yellow-400"
              >
                <UserRound className="h-5 w-5" />
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#e6e6e6] bg-white shadow-sm">
        <div className="relative" onMouseLeave={() => setHovered(null)}>
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 overflow-x-auto px-4 py-3 sm:px-6">
            {categories.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={(event) => handleHover(event, item.label)}
                className={({ isActive }) =>
                  `${navLinkBase} ${
                    isActive
                      ? "text-blue-700"
                      : "text-slate-700 hover:text-blue-600"
                  }`
                }
              >
                <span className="text-yellow-500">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {hovered === "Beauty & Spas" && beautyCategory?.subItems && (
            <div className=" absolute right-1/2 z-40  w-[520px]  rounded-3xl border border-sky-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.15)]">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {beautyCategory.subTitle}
                  </h3>
                  <button
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                    onClick={() => setHovered(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-6 text-sm text-slate-600">
                  {beautyCategory.subItems.slice(0, 2).map((col, colIndex) => (
                    <ul key={colIndex} className="space-y-2">
                      {col.map((entry) => (
                        <li key={entry}>
                          <Link
                            to={`/marketplace/beauty?category=${encodeURIComponent(
                              entry
                            )}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {entry}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          )}
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
};

function IconButton({ icon, label, badge, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-full border border-sky-200 bg-white p-2 text-blue-700 transition hover:border-yellow-400"
    >
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-500 px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}


