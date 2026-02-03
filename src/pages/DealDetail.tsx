import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import yogaImage from "@/assets/images/yoga.png"
import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import movieImage from "@/assets/images/movie.jpg"
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

const deals = [
  {
    slug: "weight-loss-week",
    title: "Weight Loss Week",
    description:
      "A focused wellness week with guided workouts, nutrition plans, and recovery sessions.",
    image: yogaImage,
    coupon: "NEWYEAR",
  },
  {
    slug: "spring-break",
    title: "Spring Break",
    description:
      "Plan your perfect getaway early with curated destinations and flexible bookings.",
    image: vacationImage,
    coupon: "SPRING25",
  },
  {
    slug: "best-anniversary-ever",
    title: "Best Anniversary Ever",
    description:
      "Celebrate with private dining, spa add-ons, and surprise experiences for two.",
    image: eventImage,
    coupon: "LOVE10",
  },
  {
    slug: "movie-magic",
    title: "Movie Magic",
    description:
      "Premium seats, combos, and exclusive showtimes for the perfect night out.",
    image: movieImage,
    coupon: "MOVIE5",
  },
]

const serviceCategories = [
  { label: "Buffet Deals", icon: icon1, slug: "buffet-deals" },
  { label: "Restaurant Deals", icon: icon2, slug: "restaurant-deals" },
  { label: "Spa Deals", icon: icon3, slug: "spa-deals" },
  { label: "Salon Deals", icon: icon4, slug: "salon-deals" },
  { label: "Games & Outings", icon: icon5, slug: "games-outings" },
  { label: "Health", icon: icon6, slug: "health" },
  { label: "Gift Cards", icon: icon7, slug: "gift-cards" },
  { label: "New Deals", icon: icon8, slug: "new-deals" },
]

const suggestionsByDealSlug: Record<string, string[]> = {
  "weight-loss-week": ["health", "spa-deals", "salon-deals"],
  "spring-break": ["games-outings", "new-deals", "gift-cards"],
  "best-anniversary-ever": ["restaurant-deals", "spa-deals", "gift-cards"],
  "movie-magic": ["games-outings", "new-deals", "gift-cards"],
}

export default function DealDetail() {
  const { slug } = useParams()
  const deal = deals.find((item) => item.slug === slug)
  const suggestionSlugs = suggestionsByDealSlug[slug ?? ""] ?? []
  const suggestions = serviceCategories.filter((item) =>
    suggestionSlugs.includes(item.slug),
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle(deal ? deal.title : "Deal details"))
  }, [dispatch, deal])

  if (!deal) {
    return (
      <div className="min-h-screen px-4 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Deal not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The deal you are looking for does not exist.
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
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)]">
          <img
            src={deal.image}
            alt={deal.title}
            className="h-80 w-full object-cover sm:h-90"
          />
          <div className="px-6 py-6 sm:px-8">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {deal.title}
            </h1>
            <p className="mt-3 text-base text-slate-600">
              {deal.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Coupon
                </p>
                <p className="text-lg font-semibold text-[#D946EF]">{deal.coupon}</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-[#E11D48] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11D48]/30"
              >
                Book now
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {suggestions.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                Suggested services
              </h2>
            </div>
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
                    Explore tailored deals related to this offer.
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
