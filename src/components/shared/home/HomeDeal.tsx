import { useEffect, useState } from "react"

import banner1 from "@/assets/images/add1.jpg"
import banner2 from "@/assets/images/add2.jpg"
import banner3 from "@/assets/images/add3.jpg"

const promoCards = [
  {
     title: "FLAT 40% OFF",
     highlight: "Haircuts & Styling",
     subtitle: "Limited time festive offer",
     cta: "Book Now",
     image: banner1,
   },
   {
      title: "Salon Makeover",
      highlight: "Trending 2024 Looks",
      subtitle: "Professional Experts",
      cta: "Book Slot",
      image: banner3,
    },
   {
     title: "FLAT 40% OFF",
     highlight: "Haircuts & Styling",
     subtitle: "Limited time festive offer",
     cta: "Book Now",
     image: banner1,
   },
  
]

export default function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % promoCards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[250px] w-screen overflow-hidden">
      <div className="absolute inset-0">
        <div className="relative h-full w-screen overflow-hidden">
         <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {promoCards.map((card) => (
          <div
            key={card.title}
            className="min-w-full h-full relative flex items-center"
            style={{
              backgroundImage: `url(${card.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />

            {/* Content */}
            <div className="relative z-10 px-6 md:px-16 text-white">
              <div className="max-w-xl">

                <p className="text-yellow-400 text-sm md:text-base uppercase tracking-widest font-semibold">
                  {card.title}
                </p>

                <h2 className="text-2xl md:text-4xl font-bold mt-1">
                  {card.highlight}
                </h2>

                <p className="text-sm md:text-lg mt-1 text-gray-200">
                  {card.subtitle}
                </p>

                <button className="mt-4 bg-yellow-400 text-black px-5 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold hover:bg-white transition-all duration-300">
                  {card.cta}
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </section>
  )
}

