import bookIcon from "@/assets/icons/book.svg"
import earthIcon from "@/assets/icons/earth.svg"
import flagIcon from "@/assets/icons/flag-sweden.svg"
import groupIcon from "@/assets/icons/group.svg"
import plantIcon from "@/assets/icons/plant.svg"
import starIcon from "@/assets/icons/Star.svg"
import sunIcon from "@/assets/icons/sun.svg"
import targetIcon from "@/assets/icons/target.svg"
import timeIcon from "@/assets/icons/Time.svg"
import checkIcon from "@/assets/icons/check.svg"

const categories = [
  { label: "New Year Sale", icon: starIcon },
  { label: "Beauty & Spas", icon: plantIcon },
  { label: "Things To Do", icon: targetIcon },
  { label: "Auto & Home", icon: bookIcon },
  { label: "Food & Drink", icon: sunIcon },
  { label: "Gifts", icon: checkIcon },
  { label: "Local", icon: groupIcon },
  { label: "Travel", icon: earthIcon },
  { label: "Goods", icon: flagIcon },
  { label: "Coupons", icon: timeIcon },
]

export default function HomeTopCategories() {
  return (
    <section className="border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-700">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 transition hover:text-slate-900"
          >
            <img src={category.icon} alt="" className="h-4 w-4" />
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
