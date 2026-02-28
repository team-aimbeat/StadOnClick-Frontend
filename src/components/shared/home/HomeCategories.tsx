import { useNavigate } from "react-router-dom"

import event from "@/assets/Images/event.jpg"
import family from "@/assets/Images/family.jpg"
import food from "@/assets/Images/food.jpg"
import travel from "@/assets/Images/travel.jpg"
import wellness from "@/assets/Images/wellness.jpg"
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"

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

type HomeCategoriesContent = {
  headingPrefix: string
  headingHighlight: string
  headingSuffix: string
  cards: CategoryCard[]
}

type HomeCategoriesProps = {
  content?: Partial<HomeCategoriesContent>
}

const CATEGORY_CARD_COUNT = 5

const fallbackCategories: CategoryCard[] = [
  {
    category: "Health & Wellness",
    image: wellness,
    author: "Top picks",
    title: "Studios, yoga, and spa escapes",
    description: "Gym, yoga, meditation, massage and spa services.",
    location: "Stockholm, SE",
    price: "From $25",
    slug: "health-wellness",
  },
  {
    category: "Food & Leisure",
    image: food,
    author: "Local favorites",
    title: "Cafes, restaurants, and hotspots",
    description: "Eateries, cafes, and weekend markets to explore.",
    location: "Stockholm, SE",
    price: "From $15",
    slug: "food-leisure",
  },
  {
    category: "Travel & Transportation",
    image: travel,
    author: "On the go",
    title: "Cab, ferry, bus, and courier",
    description: "Transportation and logistics around the city.",
    location: "Stockholm, SE",
    price: "From $10",
    slug: "travel-transportation",
  },
  {
    category: "Kids & Family",
    image: family,
    author: "Family time",
    title: "Kids events and play activities",
    description: "Play areas, hobby classes, and birthday parties.",
    location: "Stockholm, SE",
    price: "From $12",
    slug: "kids-family",
  },
  {
    category: "Experiences & Activities",
    image: event,
    author: "Explore",
    title: "Tours, museums, concerts, and more",
    description: "City events, attractions, and places to visit.",
    location: "Stockholm, SE",
    price: "From $8",
    slug: "experiences-activities",
  },
]

const fallbackContent: HomeCategoriesContent = {
  headingPrefix: "Flat Up to",
  headingHighlight: "50% Off",
  headingSuffix: "+ Extra Deals",
  cards: fallbackCategories,
}

export default function HomeCategories({ content }: HomeCategoriesProps) {
  const navigate = useNavigate()
  const rawCards = Array.isArray(content?.cards) ? content.cards : []
  const cards = Array.from({ length: CATEGORY_CARD_COUNT }, (_, index) => {
    const fallback = fallbackCategories[index]
    const raw = rawCards[index] ?? {}
    return {
      category: String(raw.category ?? "").trim() || fallback.category,
      image: String(raw.image ?? "").trim() || fallback.image,
      author: String(raw.author ?? "").trim() || fallback.author,
      title: String(raw.title ?? "").trim() || fallback.title,
      description: String(raw.description ?? "").trim() || fallback.description,
      location: String(raw.location ?? "").trim() || fallback.location,
      price: String(raw.price ?? "").trim() || fallback.price,
      slug: String(raw.slug ?? "").trim() || fallback.slug,
      restaurantSlug: typeof raw.restaurantSlug === "string" ? raw.restaurantSlug : fallback.restaurantSlug,
    }
  })
  const headingPrefix = String(content?.headingPrefix ?? "").trim() || fallbackContent.headingPrefix
  const headingHighlight = String(content?.headingHighlight ?? "").trim() || fallbackContent.headingHighlight
  const headingSuffix = String(content?.headingSuffix ?? "").trim() || fallbackContent.headingSuffix

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-387.5 px-6 py-12">
      <div className="mb-6">
  <h2 className="text-start text-[28px] sm:text-3xl lg:text-3xl font-semibold tracking-wide text-gray-900">
    {headingPrefix} <span className="text-rose-600 font-bold">{headingHighlight}</span> {headingSuffix}
  </h2>

  <div className="mt-2 h-[3px] w-20 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"></div>
</div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
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
                <ImageWithSkeleton
                  src={card.image}
                  alt={card.title}
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                  {card.category}
                </span>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2">
                  <ImageWithSkeleton
                    src={card.image}
                    alt={card.author}
                    containerClassName="h-6 w-6 rounded-full"
                    skeletonClassName="rounded-full"
                    className="h-6 w-6 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="text-[14px] font-semibold text-slate-700">
                    {card.author}
                  </p>
                </div>

                <h3 className="mt-2 text-[16px] font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-[14px] text-slate-500">
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
