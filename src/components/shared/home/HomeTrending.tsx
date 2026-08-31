import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import parkImage from "@/assets/Images/trending1.jpg"
import mallImage from "@/assets/Images/trending2.jpg"
import marketImage from "@/assets/Images/trending3.jpg"
import restaurantImage from "@/assets/Images/place4.png"
import trendingBg from "@/assets/Images/trending.jpg"
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"

type TrendingCard = {
  title: string
  offers: string
  price: string
  image: string
  link: string
}

type HomeTrendingContent = {
  heading: string
  backgroundImage: string
  places: TrendingCard[]
}

type HomeTrendingProps = {
  content?: Partial<HomeTrendingContent>
}

const TRENDING_CARD_COUNT = 4

const fallbackPlaces: TrendingCard[] = [
  {
    title: "Connaught Place",
    offers: "25 Offers",
    price: "Rs 119",
    image: parkImage,
    link: "/marketplace?place=connaught-place",
  },
  {
    title: "Aerocity",
    offers: "18 Offers",
    price: "Rs 499",
    image: mallImage,
    link: "/marketplace?place=aerocity",
  },
  {
    title: "Hauz Khas",
    offers: "32 Offers",
    price: "Rs 299",
    image: restaurantImage,
    link: "/marketplace?place=hauz-khas",
  },
  {
    title: "Saket",
    offers: "12 Offers",
    price: "Rs 199",
    image: marketImage,
    link: "/marketplace?place=saket",
  },
]

const fallbackContent: HomeTrendingContent = {
  heading: "Elevated Experiences Nearby",
  backgroundImage: trendingBg,
  places: fallbackPlaces,
}

const placeBadges = [
  "Top Destination",
  "Premium Hub",
  "Heritage Site",
  "Hidden Gem",
]

export default function HomeTrending({ content }: HomeTrendingProps) {
  const navigate = useNavigate()
  const merged = useMemo<HomeTrendingContent>(() => {
    const rawPlaces = Array.isArray(content?.places) ? content.places : []
    const places = Array.from({ length: TRENDING_CARD_COUNT }, (_, index) => {
      const fallback = fallbackPlaces[index]
      const raw = rawPlaces[index] ?? {}
      return {
        title: String(raw.title ?? "").trim() || fallback.title,
        offers: String(raw.offers ?? "").trim() || fallback.offers,
        price: String(raw.price ?? "").trim() || fallback.price,
        image: String(raw.image ?? "").trim() || fallback.image,
        link: String(raw.link ?? "").trim() || fallback.link,
      }
    })

    return {
      heading: String(content?.heading ?? "").trim() || fallbackContent.heading,
      backgroundImage: String(content?.backgroundImage ?? "").trim() || fallbackContent.backgroundImage,
      places,
    }
  }, [content])

  const handleNavigate = useCallback(
    (link: string) => {
      navigate(link)
    },
    [navigate],
  )

  return (
    <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#F5F1FF] py-14">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${merged.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.08),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h3 className="relative inline-block text-[34px] font-semibold tracking-tight text-[#1F2951] sm:text-[44px]">
            {merged.heading}
            <span className="absolute -bottom-2 left-0 h-[4px] w-24 rounded-full bg-[#2563EB]" />
          </h3>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#6B7C93] sm:text-[16px]">
            Curated local landmarks and exclusive access points designed for the discerning explorer.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {merged.places.map((place, index) => (
            <article
              key={place.title}
              className="group relative cursor-pointer overflow-hidden rounded-[30px] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.16)]"
              role="button"
              tabIndex={0}
              onClick={() => handleNavigate(place.link)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleNavigate(place.link)
                }
              }}
            >
              <div className="relative h-[320px] overflow-hidden sm:h-[340px] xl:h-[360px]">
                <ImageWithSkeleton
                  src={place.image}
                  alt={place.title}
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.90)_0%,rgba(15,23,42,0.55)_28%,rgba(15,23,42,0.10)_64%,rgba(15,23,42,0.02)_100%)]" />
                <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                  <span className="inline-flex w-fit rounded-full bg-[#A7F3D0] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F2A44] shadow-sm">
                    {placeBadges[index]}
                  </span>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[28px] font-semibold leading-none text-white drop-shadow-sm">
                        {place.title}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4 text-sm text-white/90">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Offers</p>
                        <p className="mt-1 text-base font-semibold text-white">{place.offers}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Starting from</p>
                        <p className="mt-1 text-base font-semibold text-white">{place.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

              
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
