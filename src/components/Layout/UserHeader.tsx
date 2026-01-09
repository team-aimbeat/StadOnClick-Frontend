import { Link, NavLink } from "react-router-dom"
import { Bell, Heart, Menu, ShoppingCart, UserRound } from "lucide-react"
import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react"

type Category = {
  label: string
  to: string
  subTitle?: string
  subItems?: string[][]
}

const CARD_WIDTH = 520
const pillNav =
  "relative pb-3 text-sm font-semibold text-slate-800 transition-colors hover:text-primary"

export default function UserHeader() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [dropLeft, setDropLeft] = useState<number>(0)
  const navRef = useRef<HTMLDivElement | null>(null)

  const categories = useMemo<Category[]>(
    () => [
      { label: "New Year Sale", to: "/marketplace?tag=new-year" },
      {
        label: "Beauty & Spas",
        to: "/marketplace/beauty",
        subTitle: "Beauty & Spas",
        subItems: [
          ["Massage", "Hair Removal", "Face & Skin Care", "Cosmetic Procedures"],
          ["Spas", "Hair & Styling", "Health & Fitness", "Weight Loss"],
          ["Nail Salons", "Dental", "Brows & Lashes", "Tanning"],
        ],
      },
      { label: "Things To Do", to: "/marketplace/things-to-do" },
      { label: "Auto & Home", to: "/marketplace/auto-home" },
      { label: "Food & Drink", to: "/marketplace/food" },
      { label: "Gifts", to: "/marketplace/gifts" },
      { label: "Local", to: "/marketplace/local" },
      { label: "Travel", to: "/marketplace/travel" },
      { label: "Goods", to: "/marketplace/goods" },
      { label: "Coupons", to: "/marketplace/coupons" },
    ],
    []
  )

  const beautyCategory = categories.find((c) => c.label === "Beauty & Spas")

  const handleHover = (event: MouseEvent<HTMLAnchorElement>, label: string) => {
    setHovered(label)
    if (!navRef.current) return
    const navRect = navRef.current.getBoundingClientRect()
    const linkRect = event.currentTarget.getBoundingClientRect()
    const centerOffset = linkRect.left - navRect.left + linkRect.width / 2
    const rawLeft = centerOffset - CARD_WIDTH / 2
    const maxLeft = Math.max(0, navRect.width - CARD_WIDTH)
    setDropLeft(Math.max(0, Math.min(maxLeft, rawLeft)))
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:border-primary/60 hover:text-primary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="text-base font-semibold text-slate-900 uppercase tracking-wide"
          >
            StadOnClick
          </Link>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-3 lg:flex">
          <IconButton icon={<Heart className="h-5 w-5" />} label="Wishlist" />
          <IconButton icon={<ShoppingCart className="h-5 w-5" />} label="Cart" badge="3" />
          <IconButton icon={<Bell className="h-5 w-5" />} label="Alerts" badge="9" />
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-primary/60 hover:text-primary"
          >
            <UserRound className="h-5 w-5" />
            Sign In
          </Link>
        </div>
      </div>

      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <div
          ref={navRef}
          className="relative mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8"
        >
          {categories.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={(event) => handleHover(event, item.label)}
              className={({ isActive }) =>
                `${pillNav} ${
                  isActive
                    ? "text-primary after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                    : "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:rounded-full after:bg-transparent hover:after:bg-primary/80"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        {hovered === "Beauty & Spas" && beautyCategory?.subItems && (
          <div
            onMouseEnter={() => setHovered("Beauty & Spas")}
            className="absolute right-[50%] z-40 w-[520px] rounded border border-slate-200 bg-white shadow-[0_30px_60px_rgba(15,23,42,0.1)]"

          >
            <div className="relative px-8 py-6">
              <button
                onClick={() => setHovered(null)}
                className="absolute right-4 top-4 text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                x
              </button>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {beautyCategory.subTitle}
              </h3>
              <div className="grid grid-cols-2 gap-8 text-sm text-slate-700">
                {beautyCategory.subItems.slice(0, 2).map((col, idx) => (
                  <ul key={idx} className="space-y-2">
                    {col.map((entry) => (
                      <li key={entry}>
                        <Link
                          to={`/marketplace/beauty?category=${encodeURIComponent(entry)}`}
                          className="hover:text-primary transition-colors"
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
    </header>
  )
}

type IconButtonProps = {
  icon: ReactNode
  label: string
  badge?: string
}

function IconButton({ icon, label, badge }: IconButtonProps) {
  return (
    <button className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:border-primary/60 hover:text-primary">
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  )
}
