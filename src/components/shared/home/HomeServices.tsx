import {
  BedDouble,
  Building2,
  Car,
  Dumbbell,
  GraduationCap,
  HandCoins,
  HardHat,
  Heart,
  Hotel,
  Hospital,
  Lamp,
  Landmark,
  LayoutGrid,
  Package,
  PartyPopper,
  PawPrint,
  Stethoscope,
  Truck,
  Utensils,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const categories: Array<{ name: string; icon: LucideIcon; color: string }> = [
  { name: "Restaurants", icon: Utensils, color: "text-amber-500" },
  { name: "Hotels", icon: Hotel, color: "text-sky-500" },
  { name: "Beauty Spa", icon: Heart, color: "text-rose-500" },
  { name: "Home Decor", icon: Lamp, color: "text-orange-500" },
  { name: "Wedding Planning", icon: PartyPopper, color: "text-fuchsia-500" },
  { name: "Education", icon: GraduationCap, color: "text-emerald-500" },
  { name: "Rent & Hire", icon: HandCoins, color: "text-lime-600" },
  { name: "Hospitals", icon: Hospital, color: "text-red-500" },
  { name: "Contractors", icon: HardHat, color: "text-yellow-500" },
  { name: "Pet Shops", icon: PawPrint, color: "text-teal-500" },
  { name: "PG/Hostels", icon: BedDouble, color: "text-indigo-500" },
  { name: "Estate Agent", icon: Building2, color: "text-cyan-500" },
  { name: "Dentists", icon: Stethoscope, color: "text-blue-500" },
  { name: "Gym", icon: Dumbbell, color: "text-purple-500" },
  { name: "Loans", icon: Landmark, color: "text-emerald-600" },
  { name: "Event Organisers", icon: PartyPopper, color: "text-pink-500" },
  { name: "Driving Schools", icon: Car, color: "text-slate-600" },
  { name: "Packers & Movers", icon: Truck, color: "text-amber-600" },
  { name: "Courier Service", icon: Package, color: "text-violet-500" },
  { name: "Popular Categories", icon: LayoutGrid, color: "text-sky-600" },
]

export default function HomeServices() {
  return (
    <section className="mt-10">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        {/* <h2 className="text-center text-xl font-semibold text-slate-700">
          Categories
        </h2> */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.name}
                type="button"
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div className="flex h-17 w-17 items-center justify-center rounded-2xl border border-slate-400 bg-white  transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-md">
                  <Icon className={`h-7 w-7 ${category.color}`} />
                </div>
                <span className="text-sm font-medium text-black">
                  {category.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
