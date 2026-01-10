import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import icon1 from "@/assets/icons/s1.png"
import icon2 from "@/assets/icons/s2.png"
import icon3 from "@/assets/icons/s3.png"
import icon4 from "@/assets/icons/s4.png"
import icon5 from "@/assets/icons/s5.png"
import icon6 from "@/assets/icons/s6.png"
import icon7 from "@/assets/icons/s7.png"
import icon8 from "@/assets/icons/s8.png"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"

const categories = [
  { label: "Buffet Deals", icon: icon1, slug: "buffet-deals" },
  { label: "Restaurant Deals", icon: icon2, slug: "restaurant-deals" },
  { label: "Spa Deals", icon: icon3, slug: "spa-deals" },
  { label: "Salon Deals", icon: icon4, slug: "salon-deals" },
  { label: "Games & Outings", icon: icon5, slug: "games-outings" },
  { label: "Health", icon: icon6, slug: "health" },
  { label: "Gift Cards", icon: icon7, slug: "gift-cards" },
  { label: "New Deals", icon: icon8, slug: "new-deals" },
]

const suggestionsBySlug: Record<string, string[]> = {
  "buffet-deals": ["restaurant-deals", "new-deals", "gift-cards"],
  "restaurant-deals": ["buffet-deals", "new-deals", "health"],
  "spa-deals": ["salon-deals", "health", "new-deals"],
  "salon-deals": ["spa-deals", "health", "gift-cards"],
  "games-outings": ["new-deals", "gift-cards", "restaurant-deals"],
  health: ["spa-deals", "salon-deals", "new-deals"],
  "gift-cards": ["new-deals", "restaurant-deals", "games-outings"],
  "new-deals": ["buffet-deals", "spa-deals", "games-outings"],
}

export default function ServiceCategory() {
  const { slug } = useParams()
  const current = categories.find((item) => item.slug === slug)
  const suggestionSlugs = suggestionsBySlug[slug ?? ""] ?? []
  const suggestions = categories.filter((item) => suggestionSlugs.includes(item.slug))
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle(current?.label ?? "Services"))
  }, [dispatch, current?.label])

  if (!current) {
    return (
      <div className="min-h-screen px-4 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Service not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The service you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-10">
      <div className="w-full">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <img src={current.icon} alt="" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Service</p>
              <h1 className="text-3xl font-semibold text-slate-900">{current.label}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Explore curated offers, time slots, and city-specific picks for this category.
            Apply the coupon below for instant savings.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Coupon</p>
              <p className="text-lg font-semibold text-[#D946EF]">WELCOME10</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#E11D48] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11D48]/30"
            >
              Browse offers
            </button>
            <Link
              to="/"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back to home
            </Link>
          </div>
        </section>

        {suggestions.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-slate-900">Suggestions</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((item) => (
                <Link
                  key={item.slug}
                  to={`/services/${item.slug}`}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.4)] transition hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      <img src={item.icon} alt="" className="h-7 w-7 object-contain" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Explore deals, time slots, and limited offers for this category.
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
