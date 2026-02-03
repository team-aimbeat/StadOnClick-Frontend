import { useNavigate } from "react-router-dom"

import Restro from "@/assets/Images/restro.png"
import hotel from "@/assets/Images/hotel.png"
import beauty from "@/assets/Images/beauty.png"
import salon from "@/assets/Images/hair.png"
import wedding from "@/assets/Images/wedding.png"

type CategoryCard = {
  category: string
  image: string
  author: string
  title: string
  description: string
  location: string
  price: string
  slug: string
  restaurantSlug?: string
}

const categories: CategoryCard[] = [
  {
    category: "Spa",
    image: salon,
    author: "Alina Fraser",
    title: "Hair Spa in Sweden",
    description: "Deep nourishment, relaxing care, and healthy shine.",
    location: "Pokbechi, Chicago, IL, USA",
    price: "₹220",
    slug: "salon-deals",
  },
  {
    category: "Restro",
    image: Restro,
    author: "Alina Fraser",
    title: "Everyday Dining Spot",
    description: "Comfort food, great taste, and a welcoming atmosphere.",
    location: "MBS, Dhaka",
    price: "₹550",
    slug: "buffet-deals",
    restaurantSlug: "serenity-bistro",
  },
  {
    category: "Hotel",
    image: hotel,
    author: "Eva Martin",
    title: "Comfortable Hotel Stay",
    description: "Modern amenities, peaceful comfort, and friendly service.",
    location: "The Square, NK, USA",
    price: "₹250",
    slug: "restaurant-deals",
  },
  {
    category: "Beauty",
    image: beauty,
    author: "Kian Bailey",
    title: "Luxury Beauty Experience",
    description:
      "Expert treatments with relaxing ambience and flawless results.",
    location: "The Square, NK, USA",
    price: "₹50",
    slug: "buffet-deals",
  },
  {
    category: "Wedding",
    image: wedding,
    author: "Ava Patel",
    title: "Premium Wedding Glam",
    description:
      "Expert artistry with refined elegance and lasting beauty.",
    location: "The Square, NK, USA",
    price: "₹180",
    slug: "new-deals",
  },
]

export default function HomeCategories() {
  const navigate = useNavigate()

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-4 text-start text-[26px] font-semibold text-slate-800 -tracking-tight">
          Flat Up to 50% Off + Extra Deals
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((card) => (
            <article
              key={card.title}
            className="group cursor-pointer overflow-hidden rouded-sm border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            onClick={() => {
              if (card.slug) {
                navigate(`/marketplace?category=${card.slug}`)
                return
              }
              navigate(`/marketplace?category=${card.slug}`)
            }}
            >
              <div className="relative h-40">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {card.category}
                </span>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2">
                  <img
                    src={card.image}
                    alt={card.author}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <p className="text-[11px] font-semibold text-slate-700">
                    {card.author}
                  </p>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-[12px] text-slate-500">
                  {card.description}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    {card.location}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
