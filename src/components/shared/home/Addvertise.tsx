import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, ChevronLeft, ChevronRight, Heart, ShieldCheck, Sparkle } from "lucide-react"

import travelHero from "@/assets/Images/travel.jpg"
import wellnessHero from "@/assets/Images/wellness.jpg"
import moodHero from "@/assets/Images/well.jpg"
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"

type AddvertiseContent = {
  images: string[]
  leftBadge: string
  leftTitleLine1: string
  leftTitleLine2: string
  leftDescription: string
  leftCta: string
  highlightBadge: string
  highlightTitle: string
  highlightDescription: string
  highlightCta: string
  cardOneBadge: string
  cardOneTitle: string
  cardOneDescription: string
  cardOneCta: string
  cardTwoBadge: string
  cardTwoTitle: string
  cardTwoDescription: string
  cardTwoCta: string
  featuredBadge: string
  featuredTitle: string
  featuredCta: string
}

type AddvertiseProps = {
  content?: Partial<AddvertiseContent>
}

const ADVERTISE_IMAGE_COUNT = 5

function pickText(raw: unknown, fallback: string): string {
  return typeof raw === "string" && raw.trim() ? raw.trim() : fallback
}

const fallbackContent: AddvertiseContent = {
  images: [travelHero, wellnessHero, moodHero, travelHero, wellnessHero],
  leftBadge: "LIMITED AVAILABILITY",
  leftTitleLine1: "Weekend",
  leftTitleLine2: "Specials",
  leftDescription:
    "Curated escapes and exclusive local sessions selected by our concierge for your upcoming break.",
  leftCta: "Explore all",
  highlightBadge: "Wellness Retreat",
  highlightTitle: "Revitalizing Spirit Ritual",
  highlightDescription:
    "A 4-hour massage and mindfulness session featuring essential oils, thermal baths, and guided meditation.",
  highlightCta: "Book Experience",
  cardOneBadge: "Limited Spot",
  cardOneTitle: "Artisan Wine & Cave Dining",
  cardOneDescription: "Exclusive access to the hidden cellar of a local vineyard.",
  cardOneCta: "Claim Reservation",
  cardTwoBadge: "Flash Deal",
  cardTwoTitle: "Urban Safari",
  cardTwoDescription: "Book in the next 12 minutes to get complimentary photography.",
  cardTwoCta: "Redeem Now",
  featuredBadge: "VerifiedHosts  StaySafe  EliteChoice",
  featuredTitle: "More weekend picks",
  featuredCta: "View all",
}

export default function Addvertise({ content }: AddvertiseProps) {
  const navigate = useNavigate()

  const merged = useMemo<AddvertiseContent>(() => {
    const rawImages = Array.isArray(content?.images) ? content.images : []
    const images = Array.from({ length: ADVERTISE_IMAGE_COUNT }, (_, index) => {
      const value = String(rawImages[index] ?? "").trim()
      return value || fallbackContent.images[index]
    })

    const source = content ?? {}

    return {
      ...fallbackContent,
      leftBadge: pickText(source.leftBadge, fallbackContent.leftBadge),
      leftTitleLine1: pickText(source.leftTitleLine1, fallbackContent.leftTitleLine1),
      leftTitleLine2: pickText(source.leftTitleLine2, fallbackContent.leftTitleLine2),
      leftDescription: pickText(source.leftDescription, fallbackContent.leftDescription),
      leftCta: pickText(source.leftCta, fallbackContent.leftCta),
      highlightBadge: pickText(source.highlightBadge, fallbackContent.highlightBadge),
      highlightTitle: pickText(source.highlightTitle, fallbackContent.highlightTitle),
      highlightDescription: pickText(
        source.highlightDescription,
        fallbackContent.highlightDescription,
      ),
      highlightCta: pickText(source.highlightCta, fallbackContent.highlightCta),
      cardOneBadge: pickText(source.cardOneBadge, fallbackContent.cardOneBadge),
      cardOneTitle: pickText(source.cardOneTitle, fallbackContent.cardOneTitle),
      cardOneDescription: pickText(
        source.cardOneDescription,
        fallbackContent.cardOneDescription,
      ),
      cardOneCta: pickText(source.cardOneCta, fallbackContent.cardOneCta),
      cardTwoBadge: pickText(source.cardTwoBadge, fallbackContent.cardTwoBadge),
      cardTwoTitle: pickText(source.cardTwoTitle, fallbackContent.cardTwoTitle),
      cardTwoDescription: pickText(
        source.cardTwoDescription,
        fallbackContent.cardTwoDescription,
      ),
      cardTwoCta: pickText(source.cardTwoCta, fallbackContent.cardTwoCta),
      featuredBadge: pickText(source.featuredBadge, fallbackContent.featuredBadge),
      featuredTitle: pickText(source.featuredTitle, fallbackContent.featuredTitle),
      featuredCta: pickText(source.featuredCta, fallbackContent.featuredCta),
      images,
    }
  }, [content])

  return (
    <section className="mt-1 px-3 sm:px-4">
      <div className="mx-auto max-w-8xl rounded-[28px]  p-4  sm:p-6 lg:p-8">
        <div className="rounded-[26px]  p-4 sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-[2px] w-10 rounded-full bg-[#4AA38C]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#4AA38C]">
                  {merged.leftBadge}
                </p>
              </div>
              <h2 className="mt-1 text-[clamp(2.2rem,3.8vw,3.6rem)] font-extrabold tracking-[-0.07em] text-[#24294A] leading-[0.92]">
                {merged.leftTitleLine1} {merged.leftTitleLine2}
              </h2>
              <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#8A8FA8] sm:text-[15px]">
                {merged.leftDescription}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E9E4FF] text-[#5B48D6] shadow-[0_8px_18px_rgba(91,72,214,0.12)] transition hover:-translate-y-0.5"
                aria-label="Previous special"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2E69E9] text-white shadow-[0_10px_22px_rgba(46,105,233,0.24)] transition hover:-translate-y-0.5"
                aria-label="Next special"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="group relative min-h-[320px] overflow-hidden rounded-[28px] bg-[#12163D] text-left shadow-[0_18px_34px_rgba(35,29,73,0.16)] transition duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={merged.images[0]}
                  alt="Weekend special retreat"
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,25,0.10)_0%,rgba(8,10,25,0.45)_56%,rgba(8,10,25,0.82)_100%)]" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px]">Premium Escape</span>
                <span className="rounded-full bg-[#70E6A7] px-2 py-0.5 text-[#0B4D2B]">+40% this week</span>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <div className="max-w-md text-white">
                  <h3 className="text-[clamp(1.8rem,2.5vw,2.5rem)] font-extrabold tracking-[-0.05em] drop-shadow-sm">
                    The Azure Sanctuary
                  </h3>
                  <p className="mt-2 max-w-sm text-[13px] leading-6 text-white/80">
                    Santorini, Greece - Private pool suite
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-white">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      Starting at
                    </div>
                    <div className="mt-1 text-[22px] font-extrabold">$420</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-[#2F62E6] shadow-[0_12px_18px_rgba(0,0,0,0.15)]">
                    Book Experience
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="group relative min-h-[320px] overflow-hidden rounded-[28px] bg-white text-left shadow-[0_18px_34px_rgba(35,29,73,0.08)] transition duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={merged.images[1]}
                  alt="Wellness retreat"
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,38,0.10)_0%,rgba(23,18,38,0.20)_34%,rgba(255,255,255,0.96)_60%,rgba(255,255,255,1)_100%)]" />
              <div className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2E69E9] ">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <div className="inline-flex w-fit rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4F7DF0] backdrop-blur-sm">
                  Wellness Retreat
                </div>
                <h3 className="mt-3 text-[clamp(1.4rem,2.1vw,1.8rem)] font-extrabold tracking-[-0.05em] text-black">
                  Revitalizing Spirit Ritual
                </h3>
                <p className="mt-2 max-w-sm text-[13px] leading-6 text-black">
                  A 4-hour massage and mindfulness session featuring essential oils, thermal baths, and guided meditation.
                </p>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                      Bookings
                    </div>
              
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B91A6]">
                      Starting from
                    </div>
                    <div className="mt-1 text-[22px] font-extrabold text-[#2F62E6]">
                      $185
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="group relative min-h-[190px] overflow-hidden rounded-[28px] bg-[#0D724F] text-left shadow-[0_18px_34px_rgba(13,114,79,0.16)] transition duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={merged.images[2]}
                  alt="Wine cave dining"
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,68,39,0.92)_0%,rgba(8,68,39,0.64)_36%,rgba(8,68,39,0.08)_72%,rgba(8,68,39,0.02)_100%)]" />
              <div className="absolute inset-0 flex items-end p-5 sm:p-6">
                <div className="max-w-lg text-white">
                  <div className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90">
                    Limited Spot
                  </div>
                  <h3 className="mt-3 text-[clamp(1.45rem,2vw,2rem)] font-extrabold tracking-[-0.04em]">
                    Artisan Wine & Cave Dining
                  </h3>
                  <p className="mt-2 max-w-md text-[13px] leading-6 text-white/82">
                    Exclusive access to the hidden cellar of a local vineyard.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="group flex min-h-[190px] flex-col justify-between rounded-[28px] bg-[#FFB700] p-5 text-left shadow-[0_18px_34px_rgba(255,183,0,0.18)] transition duration-300 hover:-translate-y-1 sm:p-6"
            >
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFD965] text-[#7B5200] shadow-[0_10px_18px_rgba(255,255,255,0.16)]">
                  <Sparkle className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[clamp(1.3rem,1.7vw,1.75rem)] font-extrabold tracking-[-0.04em] text-[#4E3200]">
                  Flash Deal: Urban Safari
                </div>
                <p className="mt-3 max-w-sm text-[13px] leading-6 text-[#6B4600]">
                  Book in the next 12 minutes to get complimentary photography.
                </p>
              </div>

              <div className="inline-flex w-full items-center justify-center rounded-full bg-[#5F4300] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_20px_rgba(0,0,0,0.14)]">
                Redeem Now
              </div>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[#9AA1B5]">
            {[
              { label: "VerifiedHosts", icon: ShieldCheck },
              { label: "StaySafe", icon: ShieldCheck },
              { label: "EliteChoice", icon: Sparkle },
            ].map((item) => {
              const Icon = item.icon
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold shadow-[0_8px_18px_rgba(49,34,92,0.06)]"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
