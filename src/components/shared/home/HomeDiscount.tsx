import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"

type OfferCard = {
  title: string
  subtitle: string
  price: string
  image: string
  bgImage: string
  slug: string
  navigationLink: string
}

type HomeDiscountContent = {
  heading: string
  cards: OfferCard[]
}

type HomeDiscountProps = {
  content?: Partial<HomeDiscountContent>
}

const OFFER_CARD_COUNT = 5

const fallbackOfferCards: OfferCard[] = [
  {
    title: "Buffet",
    subtitle: "Premium Dining",
    price: "₹249",
    image: "https://unsplash.com/photos/iP6ZoS0c1Sw/download?force=true",
    bgImage: "",
    slug: "buffet-deals",
    navigationLink: "/marketplace?category=buffet-deals",
  },
  {
    title: "Salon",
    subtitle: "Care & Style",
    price: "₹499",
   image: "https://plus.unsplash.com/premium_photo-1669675936501-88a782d51cb2?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    bgImage: "",
    slug: "salon-deals",
    navigationLink: "/marketplace?category=salon-deals",
  },
  {
    title: "Spa",
    subtitle: "Relaxation",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
    bgImage: "",
    slug: "spa-deals",
    navigationLink: "/marketplace?category=spa-deals",
  },
  {
    title: "Party",
    subtitle: "Nightlife",
    price: "₹1,249",
    image: "https://unsplash.com/photos/PhhPfbEvN-s/download?force=true",
    bgImage: "",
    slug: "party-deals",
    navigationLink: "/marketplace?category=party-deals",
  },
  {
    title: "Hotels",
    subtitle: "Luxury Stay",
    price: "₹2,999",
    image: "https://unsplash.com/photos/mmEwQjislHc/download?force=true",
    bgImage: "",
    slug: "hotel-deals",
    navigationLink: "/marketplace?category=hotel-deals",
  },
]

const fallbackContent: HomeDiscountContent = {
  heading: "Grab the Best Deals Today",
  cards: fallbackOfferCards,
}

const cardAccentStyles = [
  "from-emerald-900/80 via-emerald-600/15 to-transparent",
  "from-gray-900/80 via-rose-500/15 to-transparent",
  "from-blue-900/80 via-blue-600/15 to-transparent",
  "from-violet-900/80 via-violet-600/15 to-transparent",
]

const cardButtonStyles = [
  "bg-[#A7F3D0] text-[#0F2A44]",
  "bg-[#FBCFE8] text-[#0F2A44]",
  "bg-[#BFDBFE] text-[#0F2A44]",
  "bg-[#C4B5FD] text-[#0F2A44]",
  "bg-[#DCFCE7] text-[#0F2A44]",
]

export default function HomeDiscount({ content }: HomeDiscountProps) {
  const navigate = useNavigate()
  const merged = useMemo<HomeDiscountContent>(() => {
    const rawCards = Array.isArray(content?.cards) ? content.cards : []
    const cards = Array.from({ length: OFFER_CARD_COUNT }, (_, index) => {
      const fallback = fallbackOfferCards[index]
      const raw = rawCards[index] ?? {}
      return {
        title: String(raw.title ?? "").trim() || fallback.title,
        subtitle: String(raw.subtitle ?? "").trim() || fallback.subtitle,
        price: String(raw.price ?? "").trim() || fallback.price,
        image: String(raw.image ?? "").trim() || fallback.image,
        bgImage: String(raw.bgImage ?? "").trim() || fallback.bgImage,
        slug: String(raw.slug ?? "").trim() || fallback.slug,
        navigationLink: String(raw.navigationLink ?? "").trim() || fallback.navigationLink,
      }
    })
    return {
      heading: String(content?.heading ?? "").trim() || fallbackContent.heading,
      cards,
    }
  }, [content])

  return (
    <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#F5F1FF]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 space-y-3">
          <span className="inline-flex rounded-full bg-[#DBFAF2] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0F8A63]">
            Curated Selection
          </span>
          <h2 className="text-start text-[34px] font-semibold leading-tight tracking-tight text-[#0F2A44] sm:text-[44px]">
            Grab the <span className="font-bold italic text-[#2563EB]">Best Deals</span> Today
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[#5F7390]">
            Experience luxury and comfort at exclusive prices. From gourmet buffets to serene spa escapes, discover
            handpicked offers tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:auto-rows-[190px]">
          {merged.cards.map((card, index) => {
            const isFeatured = index === 0
            const isTall = index === 1
            const accent = cardAccentStyles[index % cardAccentStyles.length]
            const buttonTone = cardButtonStyles[index % cardButtonStyles.length]

            return (
              <article
                key={card.title}
                role="button"
                tabIndex={0}
                onClick={() => navigate(card.navigationLink || `/marketplace?category=${card.slug}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    navigate(card.navigationLink || `/marketplace?category=${card.slug}`)
                  }
                }}
                className={[
                  "group cursor-pointer overflow-hidden rounded-[30px] transition hover:-translate-y-1 ",
                  isFeatured ? "xl:col-span-2 xl:row-span-2" : "",
                  isTall ? "xl:row-span-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={["relative overflow-hidden", isFeatured ? "h-[340px] xl:h-full" : "h-[200px]"].join(" ") }>
                  <ImageWithSkeleton
                    src={card.image}
                    alt={card.title}
                    containerClassName="h-full w-full"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent}`} />
                  {isFeatured ? (
                    <span className="absolute right-4 top-4 rounded-full bg-[#0F8A63] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
                      {card.title === "Hotels" ? "EXCLUSIVE" : `FROM ${card.price}`}
                    </span>
                  ) : null}

                  <div
                    className={[
                      "absolute inset-0 text-white",
                      isFeatured ? "flex flex-col justify-between px-4 pb-7 pt-5" : "flex items-end p-4",
                    ].join(" ")}
                  >
                    {isFeatured ? (
                      <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                        {card.subtitle}
                      </span>
                    ) : null}

                    <div className={["flex w-full items-end justify-between gap-3", !isFeatured ? "self-end" : ""].join(" ")}>
                      <div className="min-w-0">
                        {isFeatured ? (
                          <h3 className="text-[26px] font-bold leading-none">{card.title}</h3>
                        ) : (
                          <h3 className="text-[18px] font-bold leading-none">{card.title}</h3>
                        )}
                        <p className={isFeatured ? "mt-1.5 text-[13px] text-white/95" : "mt-1 text-[11px] text-white/90"}>
                          Offers from {card.price}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`Open ${card.title}`}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${buttonTone} shadow-lg transition group-hover:scale-105`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
