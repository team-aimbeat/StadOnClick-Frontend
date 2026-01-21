import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  Bell,
  Box,
  ChevronRight,
  Coffee,
  DollarSign,
  Eye,
  Gift,
  Heart,
  Home,
  Leaf,
  MapPin,
  Plane,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
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

const navLinkBase =
  "relative flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap font-semibold text-slate-700 transition-colors duration-200";

export default function UserHeader() {
  const [hovered, setHovered] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          ["Massage", "Hair Removal", "Face & Skin Care", "Cosmetic Procedures"],
          ["Spas", "Hair & Styling", "Health & Fitness", "Weight Loss"],
          ["Nail Salons", "Dental", "Brows & Lashes", "Tanning"],
        ],
      },
      { label: "Things To Do", to: "/marketplace/things-to-do", icon: <Activity className="h-4 w-4 text-purple-500" /> },
      { label: "Auto & Home", to: "/marketplace/auto-home", icon: <Home className="h-4 w-4 text-amber-500" /> },
      { label: "Food & Drink", to: "/marketplace/food", icon: <Coffee className="h-4 w-4 text-orange-500" /> },
      { label: "Gifts", to: "/marketplace/gifts", icon: <Gift className="h-4 w-4 text-rose-500" /> },
      { label: "Local", to: "/marketplace/local", icon: <MapPin className="h-4 w-4 text-sky-500" /> },
      { label: "Travel", to: "/marketplace/travel", icon: <Plane className="h-4 w-4 text-indigo-500" /> },
      { label: "Goods", to: "/marketplace/goods", icon: <Box className="h-4 w-4 text-yellow-500" /> },
      { label: "Coupons", to: "/marketplace/coupons", icon: <Ticket className="h-4 w-4 text-violet-500" /> },
    ],
    []
  );

  const beautyCategory = categories.find((c) => c.label === "Beauty & Spas");

  const handleHover = (_event: ReactMouseEvent<HTMLAnchorElement>, label: string) => {
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
      label: "Preferences",
      icon: <Settings className="h-4 w-4" />,
    },

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
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900">
            <div className="h-10 w-10 rounded-full bg-blue-700">
              <span className="sr-only">StadOnClick logo</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">StadOnClick</p>
              <p className="text-base font-semibold text-slate-900">Discover Sweden</p>
            </div>
          </Link>

          <div className="flex-1 text-xs font-medium uppercase tracking-[0.4em] text-slate-500">
            Curated experiences. Local hosts. No filter needed.
          </div>

          <div className="flex items-center gap-3">
            <IconButton icon={<Heart className="h-5 w-5 text-slate-500" />} label="Wishlist" />
            <IconButton icon={<ShoppingCart className="h-5 w-5 text-slate-500" />} label="Cart" badge="3" />
            <IconButton icon={<Bell className="h-5 w-5 text-slate-500" />} label="Alerts" badge="9" />
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
                      <p className="text-sm font-semibold text-slate-900">Hi, {greetingName}!</p>
                      <button
                        type="button"
                        className="rounded-full p-1 text-sky-500 transition hover:bg-slate-100 hover:text-sky-700"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close menu</span>
                      </button>
                    </div>

<Link to="/account">
                    <div className="flex items-center hover:bg-gray-200 transition-colors duration-100 cursor-pointer gap-3 px-5 py-4 border-b border-sky-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-lg font-semibold text-blue-700">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{accountName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
</Link>
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

                    <div className="border-t border-sky-100 px-5 py-3">
                      <button
                        type="button"
                        className="w-full text-left text-sm font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-wait disabled:text-slate-400"
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
              <Link
                to="/sign-in"
                className="flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-sky-900 transition hover:border-yellow-400"
              >
                <UserRound className="h-5 w-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-sky-200 bg-white shadow-lg">
        <div className="relative" onMouseLeave={() => setHovered(null)}>
          <div
            className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 overflow-x-auto px-4 py-3 sm:px-6"
          >
            {categories.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={(event) => handleHover(event, item.label)}
                className={({ isActive }) =>
                  `${navLinkBase} ${
                    isActive ? "text-blue-700" : "text-slate-700 hover:text-blue-600"
                  }`
                }
              >
                <span className="text-yellow-500">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {hovered === "Beauty & Spas" && beautyCategory?.subItems && (
            <div
              className=" absolute right-1/2 z-40 mt-1 w-[520px]  rounded-3xl border border-sky-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.15)]"
            >
              <div className="px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{beautyCategory.subTitle}</h3>
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
                            to={`/marketplace/beauty?category=${encodeURIComponent(entry)}`}
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
};

function IconButton({ icon, label, badge }: IconButtonProps) {
  return (
    <button className="relative inline-flex items-center justify-center rounded-full border border-sky-200 bg-white p-2 text-blue-700 transition hover:border-yellow-400">
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
