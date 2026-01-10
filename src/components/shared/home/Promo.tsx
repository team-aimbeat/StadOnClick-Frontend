import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import hotelImage from "@/assets/images/hotel1.jpg"
import hotelAltImage from "@/assets/images/hotel2.jpg"
import hotelPinkImage from "@/assets/images/hotel3.jpg"

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
    id: "gloss",
    title: "Intense Plumping Lip Gloss",
    image: eventImage,
  },
]

export default function HomeLaunchStrip() {
  return (
    <section className="mt-10">
      <div >
        <h6 className="text-[36px] font-semibold text-slate-700 text-center">
          Exclusive Launch Alert!
        </h6>
       
      </div>

      <div className="mt-6 overflow-hidden rounded-[10px]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[320px]">
            <img
              src={vacationImage}
              alt="New aqua jelly launch"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-white/30" />
            <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-6 py-6 text-slate-900 sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                Nykaa cosmetics
              </p>
              <h3 className="text-3xl font-semibold sm:text-4xl">
                New Aqua Jelly
              </h3>
              <p className="text-sm text-slate-700">Cheek &amp; lip tint</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-slate-900">
                  Juicy shades
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Shop Now <span className="text-base">&gt;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden bg-white lg:min-h-[320px]">
            <img
              src={eventImage}
              alt="New launch collection"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 flex h-full flex-col justify-end px-6 py-6 text-white">
              <p className="text-sm font-semibold">Exclusive Launch Set</p>
              <p className="text-xs text-white/80">
                Limited edition kits in fresh shades.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
              >
                Shop Now <span className="text-base">&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {promoTiles.map((tile) => (
          <article
            key={tile.id}
            className="overflow-hidden rounded bg-white shadow-sm"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={tile.image}
                alt={tile.title}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="px-3 pb-4 pt-3 text-sm font-semibold text-slate-900">
              {tile.title}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
