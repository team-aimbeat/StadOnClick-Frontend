import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import banner1 from "@/assets/images/banner1.png"
import banner2 from "@/assets/images/banner2.png"
import banner3 from "@/assets/images/banner3.png"

const banners = [banner1, banner2, banner3]

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
  const [location] = useState(locations[0])
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [showHeroSearch, setShowHeroSearch] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowHeroSearch(window.scrollY <= 320)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
  <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-14 h-[550px] w-screen overflow-hidden">
    {/* BANNERS */}
    {banners.map((image, index) => (
      <div
        key={index}
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          index === activeIndex ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${image})` }}
      />
    ))}

    {/* OPTIONAL DARK GRADIENT FOR READABILITY */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

    {/* ================= CONTENT AT VERY BOTTOM ================= */}
    <div className="absolute bottom-8 left-1/2 w-full max-w-5xl -translate-x-1/2 px-6 text-center text-white">
      <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
        Discover Services. Book Instantly.
      </h1>

      <p className="mt-2 text-sm text-white/80 sm:text-base">
        Beauty • Sports • Events • Hotels • Vacation
      </p>

      {showHeroSearch && (
        <div className="mt-6 mx-auto w-full max-w-3xl rounded-full border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search salons, gyms, restaurants, events..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-slate-700 outline-none"
            />

            <button
              onClick={handleSearch}
              className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* POPULAR */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
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
      <div className="mt-5 flex justify-center gap-2">
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
