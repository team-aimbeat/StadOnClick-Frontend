import { useMemo } from "react"
import { useParams } from "react-router-dom"

import salonImage from "@/assets/Images/salon (1).png"

const places = {
  haircut: {
    name: "You Do You Hair Studio",
    location: "Santacruz West, Mumbai",
    rating: "4.9",
    reviews: "717",
    image: salonImage,
  },
  massage: {
    name: "Serenity Massage Studio",
    location: "Bandra West, Mumbai",
    rating: "4.8",
    reviews: "412",
    image: salonImage,
  },
  buffet: {
    name: "City Lights Buffet",
    location: "Lower Parel, Mumbai",
    rating: "4.7",
    reviews: "305",
    image: salonImage,
  },
  "party-night": {
    name: "Neon Party Lounge",
    location: "Andheri West, Mumbai",
    rating: "4.6",
    reviews: "228",
    image: salonImage,
  },
  gym: {
    name: "Peak Performance Gym",
    location: "Powai, Mumbai",
    rating: "4.8",
    reviews: "389",
    image: salonImage,
  },
  bbq: {
    name: "Smokehouse BBQ",
    location: "Juhu, Mumbai",
    rating: "4.7",
    reviews: "256",
    image: salonImage,
  },
} as const

const services = [
  {
    name: "Haircut with Dwyesh (FOR PIXIE / BUZZER CUTS)",
    duration: "1 hr",
    price: "Rs 2,000",
  },
  {
    name: "Haircut with Nikita (FOR NAPE AND LONGER)",
    duration: "1 hr",
    price: "Rs 2,500",
  },
  {
    name: "Haircut with Dwyesh (FOR NAPE AND LONGER)",
    duration: "1 hr",
    price: "Rs 2,500",
  },
]

export default function PlaceDetail() {
  const { slug } = useParams()

  const place = useMemo(() => {
    if (slug && slug in places) {
      return places[slug as keyof typeof places]
    }

    return places.haircut
  }, [slug])

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-56 w-full overflow-hidden">
            <img
              src={place.image}
              alt={place.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between gap-4 px-4 pb-2 pt-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {place.name}
              </h3>
              <p className="text-sm text-slate-500">{place.location}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-[#f59e0b]"
              >
                <path d="M12 2.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 2.5z" />
              </svg>
              <span>{place.rating}</span>
              <span className="text-slate-400">({place.reviews})</span>
            </div>
          </div>

          <div className="space-y-3 px-4 pb-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="rounded-xl bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {service.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {service.duration}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {service.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-6">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600"
            >
              See all 50 services
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
