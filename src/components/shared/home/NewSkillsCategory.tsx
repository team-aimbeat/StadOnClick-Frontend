import footballImage from "@/assets/Images/football.jpg"
import cricketImage from "@/assets/Images/cricket.jpg"
import badmintonImage from "@/assets/Images/batminton.jpg"
import tennisImage from "@/assets/Images/tennis.jpg"
import heartIcon from "@/assets/icons/heart1.svg"

const services = [
  {
    name: "Creative Studio",
    title: "Intro to Pottery: Wheel Throwing Basics",
    location: "Wicker Park, Chicago",
    distance: "2.3 mi",
    price: "$59",
    originalPrice: "$118",
    discount: "-50%",
    rating: "4.9 (340)",
    image: footballImage,
  },
  {
    name: "Flavor Lab",
    title: "Hands-On Cooking Class: Pasta Night",
    location: "West Town, Chicago",
    distance: "1.4 mi",
    price: "$45",
    originalPrice: "$90",
    discount: "-50%",
    rating: "4.8 (520)",
    image: cricketImage,
  },
  {
    name: "Lens & Light",
    title: "Beginner Photography Walk & Shoot",
    location: "River North, Chicago",
    distance: "0.9 mi",
    price: "$39",
    originalPrice: "$78",
    discount: "-50%",
    rating: "4.7 (210)",
    image: badmintonImage,
  },
  {
    name: "Rhythm Loft",
    title: "Dance Class: Salsa Fundamentals",
    location: "Lincoln Park, Chicago",
    distance: "2.8 mi",
    price: "$35",
    originalPrice: "$70",
    discount: "-50%",
    rating: "4.6 (180)",
    image: tennisImage,
  },
]

export default function NewSkillsCategory() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">New Skills, New Energy</h2>
          <p className="text-sm text-slate-500">
            Try something new with classes and creative workshops
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
