import bannerImage from "@/assets/images/banner.png"

const bookingCards = [
  { title: "Boos Turf", subtitle: "7:00 PM - 9:00 PM" },
  { title: "Blue Court", subtitle: "8:30 PM - 10:00 PM" },
]

export default function HomeTestimonial() {
  return (
    <section className="mt-12 rounded-3xl border border-white/80 bg-gradient-to-r from-[#EAF6FF] via-[#F3F7FF] to-[#EAF7F0] p-6 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.45)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex items-center gap-1 text-[#F59E0B]">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={`star-${index}`}
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
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              aria-label="Previous testimonial"
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              aria-label="Next testimonial"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl">
            <div className="space-y-3">
              {bookingCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.subtitle}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <img
                src={bannerImage}
                alt="StadOnClick app preview"
                className="h-44 w-full object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-4 h-20 w-20 rounded-full bg-[#A7F3D0] blur-2xl" />
        </div>
      </div>
    </section>
  )
}
