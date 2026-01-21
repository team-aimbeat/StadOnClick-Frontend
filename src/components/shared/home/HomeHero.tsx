import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import banner1 from "@/assets/images/banner1.png"
import banner2 from "@/assets/images/banner2.png"
import banner3 from "@/assets/images/banner3.png"

const banners = [banner1, banner2, banner3]

const searchCategories = [
  { label: "Beauty", slug: "salon-deals" },
  { label: "Sports", slug: "games-outings"},
  { label: "Events", slug: "new-deals"},
  { label: "Hotels", slug: "restaurant-deals"},
  { label: "Vacation", slug: "gift-cards"},
  { label: "Dining", slug: "buffet-deals"},
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
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const categoryLookup = useMemo(() => {
    const lookup = new Map<string, string>()
    searchCategories.forEach((c) =>
      lookup.set(c.label.toLowerCase(), c.slug),
    )
    return lookup
  }, [])

  const handleSearch = () => {
    const normalized = query.trim().toLowerCase()
    const directMatch = categoryLookup.get(normalized)
    const partialMatch = searchCategories.find((c) =>
      c.label.toLowerCase().includes(normalized),
    )  
    const target = directMatch ?? partialMatch?.slug ?? "new-deals"
    navigate(`/services/${target}`, { state: { location, query } })
  }

  return (
    <section className="relative min-h-[600px] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-14 w-screen overflow-hidden">
      {banners.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      {/* DARK OVERLAY */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/10" /> */}
      {/* CONTENT */}
      <div className="relative mx-auto flex min-h-[420px] max-w-5xl flex-col items-center justify-center px-6 pb-12 text-center text-white ">
        <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl mt-60">
          Discover Services. Book Instantly.
        </h1>

        <p className="mt-2 text-sm text-white/80 sm:text-base">
          Beauty • Sports • Events • Hotels • Vacation
        </p>
  
        {/* SEARCH BOX */}
        <div className="mt-6 w-full max-w-3xl rounded-full border border-white/70 bg-white/95 p-2 shadow-md backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search salons, gyms, restaurants, events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-500"
            />

            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              Search
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M21 20.3l-4.35-4.35a7.5 7.5 0 10-1.4 1.4L19.6 22 21 20.3zM10.5 16a5.5 5.5 0 110-11 5.5 5.5 0 010 11z" />
              </svg>
            </button>
          </div>
        </div>

        {/* POPULAR */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          <span className="font-semibold">Popular:</span>
          {popularChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => navigate(`/services/${chip.slug}`)}
              className="rounded-full bg-black/60 px-3 py-1 hover:bg-black/80"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* DOTS */}
        <div className="mt-6 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 w-2 rounded-full ${
                i === activeIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
