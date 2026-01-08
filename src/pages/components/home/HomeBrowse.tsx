import footballImage from "@/assets/images/football.jpg"
import cricketImage from "@/assets/images/cricket.jpg"
import badmintonImage from "@/assets/images/batminton.jpg"
import tennisImage from "@/assets/images/tennis.jpg"

const sports = [
  { name: "Football", image: footballImage },
  { name: "Cricket", image: cricketImage },
  { name: "Badminton", image: badmintonImage },
  { name: "Tennis", image: tennisImage },
]

export default function HomeBrowse() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">Browse by Sport</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sports.map((sport) => (
          <div
            key={sport.name}
            className="relative h-40 overflow-hidden rounded-2xl border border-white/70 text-white"
            style={{ backgroundImage: `url(${sport.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-5">
              <p className="text-lg font-semibold">{sport.name}</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-semibold"
              >
                Explore <span className="text-base">&gt;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
