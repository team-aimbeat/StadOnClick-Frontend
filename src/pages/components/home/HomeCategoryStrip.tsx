import { useNavigate } from "react-router-dom"
import iconBeauty from "@/assets/icons/s4.png"
import iconSports from "@/assets/icons/s5.png"
import iconEvents from "@/assets/icons/s1.png"
import iconHotels from "@/assets/icons/s2.png"
import iconVacation from "@/assets/icons/s8.png"
import iconDining from "@/assets/icons/s3.png"

const quickCategories = [
  { label: "Beauty", icon: iconBeauty, slug: "salon-deals" },
  { label: "Sports", icon: iconSports, slug: "games-outings" },
  { label: "Events", icon: iconEvents, slug: "new-deals" },
  { label: "Hotels", icon: iconHotels, slug: "restaurant-deals" },
  { label: "Vacation", icon: iconVacation, slug: "gift-cards" },
  { label: "Dining", icon: iconDining, slug: "buffet-deals" },
]

export default function HomeCategoryStrip() {
  const navigate = useNavigate()

  return (
    <section className="mt-6 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.35)]">
      <div className="grid grid-cols-2 divide-x divide-slate-200/70 text-xs text-slate-700 sm:grid-cols-3 lg:grid-cols-6">
        {quickCategories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => navigate(`/services/${category.slug}`)}
            className="flex items-center justify-center gap-2 px-4 py-4 transition hover:bg-slate-50"
          >
            <img
              src={category.icon}
              alt=""
              className="h-6 w-6 object-contain"
            />
            <span className="font-semibold">{category.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
