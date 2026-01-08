import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import bannerImage from "@/assets/images/banner.png"
const searchCategories = [
  { label: "Beauty", slug: "salon-deals" },
  { label: "Sports", slug: "games-outings" },
  { label: "Events", slug: "new-deals" },
  { label: "Hotels", slug: "restaurant-deals" },
  { label: "Vacation", slug: "gift-cards" },
  { label: "Dining", slug: "buffet-deals" },
]

const popularChips = [
  { label: "Spa Deals", slug: "spa-deals" },
  { label: "Weekend Turf", slug: "games-outings" },
  { label: "Wedding Venues", slug: "new-deals" },
  { label: "Resort Stays", slug: "restaurant-deals" },
]

const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad"]

export default function HomeHero() {
  const navigate = useNavigate()
  const [location, setLocation] = useState(locations[0])
  const [query, setQuery] = useState("")

  const categoryLookup = useMemo(() => {
    const lookup = new Map<string, string>()
    searchCategories.forEach((category) => {
      lookup.set(category.label.toLowerCase(), category.slug)
    })
    return lookup
  }, [])

  const handleSearch = () => {
    const normalized = query.trim().toLowerCase()
    const directMatch = categoryLookup.get(normalized)
    const partialMatch = searchCategories.find((category) =>
      category.label.toLowerCase().includes(normalized),
    )
    const target = directMatch ?? partialMatch?.slug ?? "new-deals"
    navigate(`/services/${target}`, { state: { location, query } })
  }

  return (
<section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-16 w-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundPosition: "center center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/10" />

      <div className="relative mx-auto flex min-h-[420px] max-w-5xl flex-col items-center justify-center px-4 pb-12 pt-0 text-center text-white sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold drop-shadow sm:text-3xl lg:text-4xl">
          Discover Services. Book Instantly.
        </h1>
        <p className="mt-2 text-sm text-white/80 sm:text-base">
          Beauty - Sports - Events - Hotels - Vacation
        </p>

        <div className="mt-6 w-full rounded-[28px] border border-emerald-200/80 bg-white/95 p-3 shadow-[0_16px_50px_-25px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald-600">
                <path d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.8 6.5 12.5 6.5 12.5S18.5 13.8 18.5 9c0-3.6-2.9-6.5-6.5-6.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-slate-400">
                <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm9.5 14.6-3.6-3.6 1.4-1.4 3.6 3.6-1.4 1.4z" />
              </svg>
              <input
                type="text"
                placeholder="Search services, venues, hotels, events..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch()
                }}
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_-18px_rgba(16,185,129,0.9)]"
              onClick={handleSearch}
            >
              Search <span className="text-base">&gt;</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
          <span className="font-semibold text-white/90">Popular:</span>
          {popularChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => navigate(`/services/${chip.slug}`)}
              className="rounded-full bg-black/60 px-3 py-1 text-white transition hover:bg-black/80"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-white/90">
          <span className="inline-flex items-center gap-2">
            <img src={iconVerified} alt="" className="h-4 w-4" />
            Verified Services
          </span>
          <span className="inline-flex items-center gap-2">
            <img src={iconLock} alt="" className="h-4 w-4" />
            Secure Payments
          </span>
          <span className="inline-flex items-center gap-2">
            <img src={iconTrust} alt="" className="h-4 w-4" />
            Trusted by Customers
          </span>
        </div> */}
      </div>
    </section>
  )
}
