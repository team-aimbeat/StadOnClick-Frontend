import { useNavigate } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

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
    title: "Health & Wellness",
    description: "Rejuvenate your spirit with guided meditation and thermal experiences.",
    location: "Stockholm, SE",
    price: "FROM $120",
    slug: "health-wellness",
  },
  {
    category: "Food & Leisure",
    image: food,
    author: "Local favorites",
    title: "Food & Leisure",
    description: "Exquisite dining experiences curated by Michelin-star hospitality.",
    location: "Stockholm, SE",
    price: "FROM $85",
    slug: "food-leisure",
  },
  {
    category: "Travel & Transportation",
    image: travel,
    author: "On the go",
    title: "Travel & Transport",
    description: "Seamless private aviation and luxury fleet rentals at your service.",
    location: "Stockholm, SE",
    price: "FROM $450",
    slug: "travel-transportation",
  },
  {
    category: "Experiences & Activities",
    image: event,
    author: "Explore",
    title: "Experiences",
    description: "Bucket-list adventures designed for those who seek more.",
    location: "Stockholm, SE",
    price: "EXCLUSIVE",
    slug: "experiences-activities",
  },
  {
    category: "Kids & Family",
    image: family,
    author: "Family time",
    title: "Kids & Family",
    description: "Family-friendly activities, birthdays, and weekend fun.",
    location: "Stockholm, SE",
    price: "FROM $60",
    slug: "kids-family",
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
    <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] overflow-hidden">
      <div className="relative z-10 mx-auto  px-6 py-12">
        <div className="mb-8">
          <h2 className="text-start text-[28px] font-semibold tracking-wide text-[#0F2A44] sm:text-3xl lg:text-3xl">
            {headingPrefix} <span className="font-bold text-[#2563EB]">{headingHighlight}</span> {headingSuffix}
          </h2>
          <div className="mt-2 h-[3px] w-20 rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group cursor-pointer  overflow-hidden rounded-[34px] border border-slate-200 bg-white p-3 transition hover:-translate-y-1 "
            onClick={() => {
              if (card.slug) {
                navigate(`/marketplace?category=${card.slug}`)
                return
              }
              navigate(`/marketplace?category=${card.slug}`)
            }}
            >
              <div className="relative overflow-hidden rounded-[28px]">
                <ImageWithSkeleton
                  src={card.image}
                  alt={card.title}
                  containerClassName="h-[220px] w-full"
                  className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute right-4 top-4 rounded-full bg-[#0F8A63] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
                  {card.price}
                </span>
              </div>

              <div className="relative px-2 pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[18px] font-bold leading-tight text-[#334155]">
                      {card.title}
                    </h3>
                    <p className="mt-2 max-h-10 overflow-hidden text-[13px] leading-5 text-[#6B7280]">
                      {card.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Open ${card.title}`}
                    className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#2563EB] transition group-hover:bg-[#DBEAFE]"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
