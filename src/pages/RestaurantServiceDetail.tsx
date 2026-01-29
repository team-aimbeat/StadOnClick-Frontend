import { ChevronLeft, Heart, MapPin, Share2, Star } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { restaurants } from "@/data/restaurants"

export default function RestaurantServiceDetail() {
  const navigate = useNavigate()
  const { restaurantSlug } = useParams<{ restaurantSlug?: string }>()
  const restaurant =
    restaurants.find((item) => item.slug === restaurantSlug) ?? restaurants[0]

  return (
    <section className="min-h-screen bg-[#F4F6FA] py-10 text-slate-700">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to restaurants
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {restaurant.location}
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  {restaurant.name}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {restaurant.culinaryStyle}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {restaurant.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-inner">
                <img
                  src={restaurant.heroImages[0]}
                  alt={`${restaurant.name} hero`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-4">
                {restaurant.heroImages.slice(1).map((image) => (
                  <div
                    key={image}
                    className="relative h-28 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner"
                  >
                    <img
                      src={image}
                      alt={`${restaurant.name} gallery`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                <button className="mt-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300">
                  View full gallery
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  {restaurant.description}
                </p>
                <div className="space-y-4">
                  {restaurant.menuHighlights.map((menu) => (
                    <article
                      key={menu.title}
                      className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                        <h3>{menu.title}</h3>
                        <span className="text-blue-600">{menu.price}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {menu.items.join(" · ")}
                      </p>
                    </article>
                  ))}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Chef's specials
                  </p>
                  <div className="mt-3 space-y-3">
                    {restaurant.chefSpecials.map((special) => (
                      <div
                        key={special.title}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {special.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {special.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium text-slate-600">
                      {restaurant.location}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{restaurant.address}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">
                    {restaurant.hours}
                  </p>
                  <p className="text-xs text-slate-400">Walk-ins welcome</p>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">
                    {restaurant.contact.phone}
                  </p>
                  <p className="text-xs text-slate-400">
                    {restaurant.contact.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Average rating
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-3xl font-bold text-slate-900">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Based on {restaurant.reviews} guest reviews
                  </p>
                </div>
                <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Reserve a table
                </button>
                <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-slate-300">
                  Send private enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
