import { ArrowRight, Anchor, ChefHat, Leaf, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

import heroImage from "@/assets/Images/banner.avif"
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"

const offerItems = [
  {
    icon: Leaf,
    title: "Unlimited Spa Access",
    subtitle: "Signature treatments included daily",
  },
  {
    icon: ChefHat,
    title: "Private Chef Experience",
    subtitle: "Five-course tasting menu",
  },
  {
    icon: Anchor,
    title: "Sunset Yacht Charter",
    subtitle: "Private 3-hour coastal navigation",
  },
]

export default function HomeMind() {
  const navigate = useNavigate()

  return (
    <section className="px-3 sm:px-4 ">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px]  px-5 py-8  sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="absolute inset-0">
          <ImageWithSkeleton
            src={heroImage}
            alt="Weekend indulgence ocean retreat"
            containerClassName="h-full w-full"
            className="h-full w-full object-cover object-[center_36%] scale-[1.06] opacity-95"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,239,255,0.98)_0%,rgba(245,239,255,0.88)_28%,rgba(245,239,255,0.66)_54%,rgba(245,239,255,0.30)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_74%_18%,rgba(78,125,255,0.18),transparent_22%),radial-gradient(circle_at_76%_72%,rgba(255,205,56,0.12),transparent_20%)]" />
        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-12">
          <div className="max-w-xl pt-16 sm:pt-20 lg:pt-24">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6DE0A1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#134A2F] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#134A2F]" />
              Curated Experience
            </div>

            <h3 className="mt-5 max-w-[540px] text-[clamp(3rem,5.6vw,5.1rem)] font-extrabold leading-[0.92] tracking-[-0.08em] text-[#2B315E]">
              Exclusive
              <span className="block text-[#2E69E9]">Weekend</span>
              Indulgence.
            </h3>

            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#66708E] sm:text-[16px]">
              Escape the ordinary with a bespoke 48-hour retreat designed for
              those who demand more than just a getaway. Private villas,
              Michelin dining, and curated peace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="inline-flex items-center gap-2 rounded-full bg-[#2F62E6] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(47,98,230,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2453CA]"
              >
                Secure Your Spot
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#2B315E] shadow-[0_14px_28px_rgba(47,98,230,0.10)] transition duration-300 hover:-translate-y-0.5"
              >
                Explore Details
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none lg:justify-self-end lg:translate-y-3">
            <div className="absolute -right-2 top-0 z-20 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFBF1F] text-center shadow-[0_12px_24px_rgba(255,191,31,0.28)]">
              <div className="text-[10px] font-extrabold uppercase leading-none text-[#6A4A00]">
                Save
                <div className="mt-1 text-[19px] leading-none">15%</div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] bg-white p-4 shadow-[0_26px_60px_rgba(31,39,81,0.18)] ring-1 ring-black/5">
              <div className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2F62E6] shadow-[0_8px_18px_rgba(47,98,230,0.16)]">
                <Star className="h-4 w-4 fill-current" />
              </div>

              <div className="rounded-[24px] bg-white p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4F7DF0]">
                  Limited Availability
                </div>
                <h4 className="mt-2 text-[clamp(1.8rem,2.6vw,2.45rem)] font-extrabold tracking-[-0.05em] text-[#2B315E]">
                  The Signature Suite
                </h4>

                <div className="mt-6 space-y-3">
                  {offerItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 rounded-[18px] bg-[#F7F8FC] px-4 py-3 shadow-[0_8px_16px_rgba(31,39,81,0.04)]"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF1FF] text-[#1E6B4E]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-[#2B315E]">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#8A90A8]">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A90A8]">
                      Starting from
                    </div>
                    <div className="mt-1 text-[clamp(2rem,3vw,2.7rem)] font-extrabold tracking-[-0.06em] text-[#2B315E]">
                      $2,499
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="inline-flex items-center gap-2 rounded-full bg-transparent px-2 py-2 text-[14px] font-semibold text-[#2F62E6] transition hover:translate-x-0.5"
                  >
                    View Offer
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
