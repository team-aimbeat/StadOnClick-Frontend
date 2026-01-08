import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import movieImage from "@/assets/images/movie.jpg"
import footballImage from "@/assets/images/football.jpg"
import heartIcon from "@/assets/icons/heart1.svg"

const services = [
  {
    name: "Derma Bliss Beauty Spa",
    title: "Experience Derma Bliss Beauty Spa's HydraFacial",
    location: "Lincoln Park, Chicago",
    distance: "3.2 mi",
    price: "$85",
    originalPrice: "$100",
    discount: "-15%",
    rating: "4.8 (1,209)",
    image: eventImage,
  },
  {
    name: "Angels Touch",
    title: "Rejuvenate Your Skin with HydraFacial",
    location: "Streeterville, Chicago",
    distance: "1 mi",
    price: "$150",
    originalPrice: "$250",
    discount: "-40%",
    rating: "5 (270)",
    image: vacationImage,
  },
  {
    name: "Heavenly Massage",
    title: "Mini or Full Spa Day: Massage, Facial, Steam Shower",
    location: "1221 North State Pkwy, Chicago",
    distance: "1.7 mi",
    price: "$179.99",
    originalPrice: "$229",
    discount: "-21%",
    rating: "4.6 (19,100)",
    image: movieImage,
  },
  {
    name: "T'Amor Day & Wellness Spa",
    title: "Pamper Yourself: Choice of Massage or Body Scrub",
    location: "Beverly, Chicago",
    distance: "2.4 mi",
    price: "$65",
    originalPrice: "$115",
    discount: "-43%",
    rating: "4.7 (880)",
    image: footballImage,
  },
]

export default function GlowCategory() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Spa and Salon</h2>
          <p className="text-sm text-slate-500">
            Brighten your look with facials and aesthetic treatments
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
                Popular Gift
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
