import { useNavigate } from "react-router-dom"
import cricketImage from "@/assets/Images/cricket.jpg"
import footballImage from "@/assets/Images/football.jpg"
import badmintonImage from "@/assets/Images/batminton.jpg"

const categoryCards = [
  {
    title: "Sports & Games",
    description: "Book courts, teams, and tournaments",
    image: cricketImage,
    slug: "games-outings",
  },
  {
    title: "Art & Culture",
    description: "Shows, museums, and live events",
    image: footballImage,
    slug: "new-deals",
  },
  {
    title: "Daily Trips",
    description: "Quick escapes and day adventures",
    image: badmintonImage,
    slug: "gift-cards",
  },
]

export default function HomeCategoryStrip() {
  const navigate = useNavigate()

  return (
    <section className="mt-8 w-full rounded-3xl bg-[#f2f6fb] px-6 py-10 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Categories
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-800 sm:text-2xl">
          Browse by Interest
        </h3>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {categoryCards.map((category) => (
          <button
            key={category.title}
            type="button"
            onClick={() => navigate(`/services/${category.slug}`)}
            className="group rounded-2xl bg-white px-6 pb-6 pt-10 text-center shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-1"
          >
            <div className="mx-auto -mt-16 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
              <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover"
              />
            </div>
            <h4 className="mt-5 text-sm font-semibold text-slate-800">
              {category.title}
            </h4>
            <p className="mt-2 text-xs text-slate-500">
              {category.description}
            </p>
            <div className="mx-auto mt-4 h-3 w-10 rounded-t-full bg-[#0f2f4f]" />
          </button>
        ))}
      </div>


      <p className="mt-6 text-center text-xs text-slate-400">
        100+ categories available for you to explore today.
      </p>
    </section>
  )
}
