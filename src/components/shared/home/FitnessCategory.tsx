import footballImage from "@/assets/images/football.jpg"
import cricketImage from "@/assets/images/cricket.jpg"
import badmintonImage from "@/assets/images/batminton.jpg"
import tennisImage from "@/assets/images/tennis.jpg"
import heartIcon from "@/assets/icons/heart1.svg"

const services = [
  {
    name: "Flex Fitness Studio",
    title: "Full-Body Strength Session with Trainer",
    location: "River North, Chicago",
    distance: "1.9 mi",
    price: "$45",
    originalPrice: "$90",
    discount: "-50%",
    rating: "4.9 (980)",
    image: footballImage,
  },
  {
    name: "Pulse Gym",
    title: "HIIT Class Pass for All Levels",
    location: "West Loop, Chicago",
    distance: "2.6 mi",
    price: "$30",
    originalPrice: "$60",
    discount: "-50%",
    rating: "4.7 (640)",
    image: cricketImage,
  },
  {
    name: "Core & Flow",
    title: "Pilates Reformer Intro Session",
    location: "Old Town, Chicago",
    distance: "1.2 mi",
    price: "$55",
    originalPrice: "$110",
    discount: "-50%",
    rating: "4.8 (520)",
    image: badmintonImage,
  },
  {
    name: "Zen Yoga Loft",
    title: "Unlimited Yoga for Two Weeks",
    location: "Lakeview, Chicago",
    distance: "3.1 mi",
    price: "$39",
    originalPrice: "$78",
    discount: "-50%",
    rating: "4.6 (410)",
    image: tennisImage,
  },
]

export default function FitnessCategory() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Fitness Favorites</h2>
          <p className="text-sm text-slate-500">
            Train smarter with top-rated studios and classes
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-emerald-700"
        >
          See More
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.name}
            className="rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="relative">
              <img
                src={service.image}
                alt={service.name}
                className="h-36 w-full rounded-t-2xl object-cover"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                Popular Pick
              </span>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                <img src={heartIcon} alt="" className="h-3 w-3" />
              </span>
            </div>

            <div className="space-y-2 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {service.name}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {service.title}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{service.location}</span>
                <span>{service.distance}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Rating {service.rating}</span>
                <span>{service.discount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 line-through">
                  {service.originalPrice}
                </span>
                <span className="font-semibold text-emerald-700">
                  {service.price}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
