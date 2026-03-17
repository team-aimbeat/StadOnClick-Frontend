import { useRef } from "react"

import eventImage from "@/assets/Images/event.jpg"
import hotelImage from "@/assets/Images/hotel1.jpg"
import hotelAltImage from "@/assets/Images/hotel2.jpg"
import hotelPinkImage from "@/assets/Images/hotel3.jpg"
import vacationImage from "@/assets/Images/vacation.jpeg"

const promoTiles = [
  {
    id: "cushion",
    title: "Full Coverage Cushion Foundation",
    image: hotelAltImage,
  },
  {
    id: "lipstick",
    title: "16Hr Longstay Lipstick",
    image: hotelPinkImage,
  },
  {
    id: "whipped",
    title: "Viral: Whipped Multi-use Pot",
    image: hotelImage,
  },
  {
    id: "velvet",
    title: "Velvet Matte Lip Color",
    image: eventImage,
  },
  {
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: hotelAltImage,
  },
  {
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: hotelAltImage,
  },{
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: hotelAltImage,
  },{
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: hotelAltImage,
  },{
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: hotelAltImage,
  },
]

export default function HomeLaunchStrip() {
  const sliderRef = useRef<HTMLDivElement>(null)

  const CARD_WIDTH = 260 + 16 // card width + gap

  const slideLeft = () => {
    sliderRef.current?.scrollBy({
      left: -CARD_WIDTH,
      behavior: "smooth",
    })
  }

  const slideRight = () => {
    sliderRef.current?.scrollBy({
      left: CARD_WIDTH,
      behavior: "smooth",
    })
  }

  return (
    <section className="mt-10 w-full hidden">
      <h6 className="text-center text-[36px] font-semibold text-slate-700">
        Exclusive Launch Alert!
      </h6>
  <div className="mt-6 overflow-hidden rounded-[10px]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          {/* Left Banner */}
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[320px]">
          
            <img
              src={vacationImage}
              alt="New Aqua Jelly"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-white/30" />

            <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-6 sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                Nykaa Cosmetics
              </p>
              
              <h3 className="text-3xl font-semibold sm:text-4xl">
                New Aqua Jelly
              </h3>


              <p className="text-sm text-slate-700">Cheek &amp; lip tint</p>

              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-slate-900">
                  Juicy shades
                </span>
                <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  Shop Now →
                </button>
              </div>
            </div>
          </div>

          {/* Right Banner */}
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[320px] ">
            <img
              src={eventImage}
              alt="Exclusive Launch"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 flex h-full flex-col justify-end px-6 py-6 text-white">
              <p className="text-sm font-semibold">Exclusive Launch Set</p>
              <p className="text-xs text-white/80">
                Limited edition kits in fresh shades.
              </p>
              <button className="mt-4 w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900">
                Shop Now →
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ===== EDGE TO EDGE SLIDER WITH ARROWS ===== */}
      <div className="relative left-1/2 right-1/2 mt-6 w-screen -ml-[50vw] -mr-[50vw] px-0 py-4 bg-[#f9ead6]">
        {/* LEFT ARROW */}
        <button
          onClick={slideLeft}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2
                     rounded-full bg-white p-3 shadow hover:bg-slate-100"
        >
          ‹
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={slideRight}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2
                     rounded-full bg-white p-3 shadow hover:bg-slate-100"
        >
          ›
        </button>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-10 scrollbar-hide"
        >
          {promoTiles.map((tile) => (
            <article
              key={tile.id}
              className="min-w-[220px] sm:min-w-[240px] lg:min-w-[260px]
                         cursor-pointer overflow-hidden rounded bg-white
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <p className="px-3 pb-4 pt-3 text-base font-semibold text-slate-900">
                {tile.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
