import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import hotelImage from "@/assets/images/hotel1.jpg"
import hotelAltImage from "@/assets/images/hotel2.jpg"
import hotelPinkImage from "@/assets/images/hotel3.jpg"



// const bottomPicks = [
//   { id: "cleanser", image: hotelPinkImage },
//   { id: "moisture", image: vacationImage },
//   { id: "serum", image: eventImage },
//   { id: "mask", image: hotelAltImage },
//   { id: "spf", image: hotelImage },
// ]

export default function HomeGlowSale() {
  return (
    <section className="mt-0">
      

      {/* FULL BLEED WRAPPER */}
<div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen ">
  <div className="bg-[#f4f3fe] py-6 ">
    {/* CONTENT CONTAINER */}
    <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8 ">
      <div className="overflow-hidden rounded-[28px] p-5">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col justify-center gap-3 px-6 py-6 sm:px-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-rose-700">
              Skintastic Sale
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                New year edit
              </span>
            </div>

            <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              New Year, New Glow
            </h3>

            <p className="text-sm text-slate-700">
              Up to 40% off on bestsellers and glow kits.
            </p>
            <p className="text-sm text-slate-600">
              Discover curated skincare essentials designed to brighten, hydrate,
              and protect. Limited-time bundles pair hero products with travel
              minis for a complete glow routine.
            </p>

            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Limited glow kits
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Free mini on ₹999+
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Top-rated picks
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Extra 5% with code GLOW
              </span>
            </div>

            

          
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative min-h-[180px] overflow-hidden rounded-[20px] lg:min-h-[240px]">
            <img
              src={hotelPinkImage}
              alt="New year glow picks"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 from-transparent via-white/30 to-white/70" />
          </div>

        </div>
      </div>
    </div>
  </div>
</div>


      {/* <div className="mt-6 rounded-[28px] bg-[#FCE7F3] p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {bottomPicks.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-pink-300 to-rose-400 p-4"
            >
              <img
                src={item.image}
                alt=""
                className="h-28 w-28 rounded-xl object-cover shadow-md"
              />
            </article>
          ))}
        </div>
      </div> */}
    </section>
  )
}
