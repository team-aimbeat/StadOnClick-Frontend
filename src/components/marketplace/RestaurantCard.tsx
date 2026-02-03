import { MapPin, Star } from "lucide-react"
import { RestaurantDetail } from "@/data/restaurants"

type RestaurantCardProps = {
  restaurant: RestaurantDetail
  onExplore: (restaurant: RestaurantDetail) => void
  onReserve: (restaurant: RestaurantDetail) => void
}

export default function RestaurantCard({
  restaurant,
  onExplore,
  onReserve,
}: RestaurantCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.heroImages[0]}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
          <Star className="h-3 w-3 text-amber-500" />
          {restaurant.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{restaurant.name}</h3>
          <p className="text-sm text-slate-500">{restaurant.culinaryStyle}</p>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{restaurant.location}</span>
          </div>
          <p>{restaurant.hours}</p>
          <p className="text-xs text-slate-400">{restaurant.description}</p>
        </div>

        <div className="space-y-2">
          {restaurant.menuHighlights.slice(0, 2).map((menu) => (
            <div
              key={menu.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>{menu.title}</span>
                <span>{menu.price}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{menu.items.slice(0, 3).join(" · ")}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-3">
          <button
            type="button"
            onClick={() => onExplore(restaurant)}
            className="flex-1 rounded-2xl border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Explore
          </button>
          <button
            type="button"
            onClick={() => onReserve(restaurant)}
            className="flex-1 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Reserve
          </button>
        </div>
      </div>
    </article>
  )
}
