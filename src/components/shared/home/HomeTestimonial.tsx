import bannerImage from "@/assets/images/banner.png"

const bookingCards = [
  { title: "Boos Turf", subtitle: "7:00 PM - 9:00 PM" },
  { title: "Blue Court", subtitle: "8:30 PM - 10:00 PM" },
]

export default function HomeTestimonial() {
  return (
    /* FULL BLEED WRAPPER */
    <section className="relative left-1/2 right-1/2 mt-12 w-screen -translate-x-1/2">
      {/* BACKGROUND + INNER CONTAINER */}
      <div >
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
<div className="rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              {/* LEFT */}
              <div>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current"
                    >
                      <path d="M12 2.5l2.6 5.4 6 0.9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-0.9L12 2.5z" />
                    </svg>
                  ))}
                </div>

                <p className="mt-4 text-xl font-semibold text-slate-900 sm:text-2xl">
                  Best platform to book football turfs in my city.
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  Instant confirmation, reliable venues, and easy reschedule.
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#CBD5F5]" />
                  <div>
                    <p className="text-sm font-semibold">Aman S.</p>
                    <p className="text-xs text-slate-500">Football</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm">
                    &lt;
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm">
                    &gt;
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative">
                <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl">
                  <div className="space-y-3">
                    {bookingCards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border bg-white px-4 py-3"
                      >
                        <p className="text-sm font-semibold">{card.title}</p>
                        <p className="text-xs text-slate-500">
                          {card.subtitle}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border">
                    <img
                      src={bannerImage}
                      alt="StadOnClick app preview"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
