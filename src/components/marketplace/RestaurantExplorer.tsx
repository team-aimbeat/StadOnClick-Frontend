import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, MapPin, Star } from "lucide-react"
import { restaurants, RestaurantDetail } from "@/data/restaurants"

const filters = ["Popular", "Chef's Picks", "New", "Rooftop"]

export default function RestaurantExplorer() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(filters[0])

  return (
    <section className="min-h-screen bg-[#F9F9F9] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:px-8">
        <header
          className="space-y-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl lg:flex lg:items-center lg:justify-between lg:gap-6"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Restaurants
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dine-in & rooftop experiences
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Curated menus, chef specials, and seasonal cocktails across
              verified venues.
            </p>
          </div>
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.slug}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-1"
            >
              <div className="relative h-52 overflow-hidden rounded-t-3xl">
                <img
                  src={restaurant.heroImages[0]}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {restaurant.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3 w-3" />
                    {restaurant.rating.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{restaurant.culinaryStyle}</p>

                <div className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {restaurant.menuHighlights.slice(0, 2).map((menu) => (
                    <div key={menu.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {menu.title}
                        </p>
                        <span className="text-sm font-semibold text-slate-900">
                          {menu.price}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {menu.items.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/restaurants/${restaurant.slug}`)}
                    className="flex-1 rounded-2xl border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Reserve a table
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
