import bannerImage from "@/assets/images/banner.png"

const bookingCards = [
  {
    title: "Boos Turf",
    subtitle: "7:00 PM - 9:00 PM",
    date: "Today",
    price: "Rs 11,200",
  },
  {
    title: "Blue Court",
    subtitle: "8:30 PM - 10:00 PM",
    date: "Tomorrow",
    price: "Rs 11,500",
  },
]

const stats = [
  { label: "Bookings", value: "120k+" },
  { label: "Verified Turfs", value: "4,800+" },
  { label: "Cities", value: "30+" },
]

export default function HomeTestimonial() {
  return (
    <section className="mt-20">
      {/*Increased max width */}
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">

        {/* OUTER CARD */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-12 lg:p-16 shadow-sm">
          <div className="grid gap-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          
            {/* LEFT CONTENT */}
            <div>
              {/* Stars */}
              <div className="flex items-center gap-1 text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M12 2.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 2.5z" />
                  </svg>
                ))}
                <span className="ml-2 text-xs text-slate-500">(4.9/5)</span>
              </div>
              
              

            
              {/* Heading */}
              <h3 className="mt-5 text-3xl font-semibold text-slate-900 max-w-xl">
                The easiest way to book football turfs in your city
              </h3>
        
               {/* Description */}
              <p className="mt-4 text-base text-slate-600 max-w-lg">
                Discover verified venues, get instant confirmations,
                flexible rescheduling, and play without last
                -minute stress.
              </p>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* User */}
              <div className="mt-10 flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-slate-200"/>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Aman S.
                  </p>
                  <p className="text-xs text-slate-500">
                    Regular Player at Football
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex gap-4">
                <button className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition">
                  Book a Turf
                </button>
                <button className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  Explore Venues
                </button>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="space-y-5">
              {/* Booking Cards */}
              {bookingCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-5 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {card.subtitle} at {card.date}
                      </p>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {card.price}
                    </span>
                  </div>
                </div>
              ))}

              {/* Image */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={bannerImage}
                  alt="App preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
