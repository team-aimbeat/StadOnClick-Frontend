import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  Bell,
  Box,
  Coffee,
  Gift,
  Heart,
  Home,
  Leaf,
  MapPin,
  Menu,
  Plane,
  ShoppingCart,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";

type Category = {
  label: string;
  to: string;
  icon: ReactNode;
  subTitle?: string;
  subItems?: string[][];
};

const CARD_WIDTH = 520;
const navLinkBase =
  "relative flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap font-semibold text-slate-700 transition-colors duration-200";

export default function UserHeader() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [dropLeft, setDropLeft] = useState<number>(0);
  const navRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo<Category[]>(
    () => [
      {
        label: "New Year Sale",
        to: "/marketplace?tag=new-year",
        icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
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
      { label: "Goods", to: "/marketplace/goods", icon: <Box className="h-4 w-4 text-emerald-600" /> },
      { label: "Coupons", to: "/marketplace/coupons", icon: <Ticket className="h-4 w-4 text-violet-500" /> },
    ],
    []
  );

  const beautyCategory = categories.find((c) => c.label === "Beauty & Spas");

  const handleHover = (event: MouseEvent<HTMLAnchorElement>, label: string) => {
    setHovered(label);
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = event.currentTarget.getBoundingClientRect();
    const centerOffset = linkRect.left - navRect.left + linkRect.width / 2;
    const rawLeft = centerOffset - CARD_WIDTH / 2;
    const maxLeft = Math.max(0, navRect.width - CARD_WIDTH);
    setDropLeft(Math.max(0, Math.min(maxLeft, rawLeft)));
  };

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
            <div className="h-10 w-10 rounded-full bg-emerald-500 ">
              <span className="sr-only">StadOnClick logo</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-600">StadOnClick</p>
              <p className="text-base font-semibold text-slate-900">Discover Sweden</p>
            </div>
          </Link>

          <div className="flex-1 text-xs font-medium uppercase tracking-[0.4em] text-slate-500">
            Curated experiences. Local hosts. No filter needed.
          </div>

          <div className="flex items-center gap-3">
            <IconButton icon={<Heart className="h-5 w-5 text-rose-500" />} label="Wishlist" />
            <IconButton icon={<ShoppingCart className="h-5 w-5 text-emerald-500" />} label="Cart" badge="3" />
            <IconButton icon={<Bell className="h-5 w-5 text-slate-600" />} label="Alerts" badge="9" />
            <Link
              to="/sign-in"
              className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-500"
            >
              <UserRound className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
          <div className="relative" onMouseLeave={() => setHovered(null)}>
          <div
            ref={navRef}
            className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 overflow-x-auto px-4 py-3 sm:px-6"
          >
            {categories.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={(event) => handleHover(event, item.label)}
                className={({ isActive }) =>
                  `${navLinkBase} ${
                    isActive ? "text-emerald-600" : "text-slate-700 hover:text-emerald-600"
                  }`
                }
              >
                <span className="text-slate-400">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {hovered === "Beauty & Spas" && beautyCategory?.subItems && (
            <div
              className="pointer-events-auto absolute left-1/2 z-40 mt-1 w-[520px] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white shadow-[0_40px_60px_rgba(15,23,42,0.15)]"
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
                            className="hover:text-emerald-600 transition-colors"
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
    <button className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-emerald-500">
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}
