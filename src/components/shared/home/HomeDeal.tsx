import { useEffect, useState } from "react"

import banner1 from "@/assets/images/add1.jpg"
import banner2 from "@/assets/images/add2.jpg"
import banner3 from "@/assets/images/add3.jpg"

const promoCards = [
  {
    title: "Haircuts",
    subtitle: "Offers under Rs 399",
    cta: "Buy Now",
    accent: "from-[#e3be6f] to-transparent",
    image: banner1,
  },
  {
    title: "Spa & Wellness",
    subtitle: "Relaxing care packages",
    cta: "Explore",
    accent: "from-[#d45b53] to-transparent",
    image: banner2,
  },
  {
    title: "Salon Makeovers",
    subtitle: "Trending styles for 2024",
    cta: "Book Slot",
    accent: "from-[#8f5ab9] to-transparent",
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
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {promoCards.map((card) => (
              <article
                key={card.title}
                className="min-w-full h-full"
              >
                <div
                  className="flex h-full w-full items-center gap-6 p-8"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="flex flex-1 flex-col gap-3">
                    <span className={`h-12 w-2 rounded-full bg-gradient-to-b ${card.accent}`} />

                    <h2 className="text-4xl font-serif font-semibold text-white">
                      {card.title}
                    </h2>

                    <p className="text-xl text-white">
                      {card.subtitle}
                    </p>

                    <button className="mt-4 w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#111] hover:text-white">
                      {card.cta}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

